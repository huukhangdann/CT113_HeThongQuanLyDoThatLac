const path = require('path');
const { saveRecord } = require('../../database/engine/write');
const { getLostLocation } = require('../utils/lostItemLocation');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeId = value => String(value || '').trim();

const readPayload = reqBody => {
    if (!reqBody) return {};
    if (typeof reqBody.data === 'string') {
        try {
            const parsed = JSON.parse(reqBody.data);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (e) {
            throw createError(`Dữ liệu JSON không hợp lệ: ${e.message}`);
        }
    }
    return reqBody;
};

const saveOrThrow = (dataFolderPath, tableName, recordId, payload, db) => {
    if (!saveRecord(dataFolderPath, tableName, recordId, payload, db)) {
        throw createError(`Không thể lưu dữ liệu vào bảng ${tableName}.`, 500);
    }
};

/**
 * Tự động chuyển các bài đăng ở trạng thái "Đang xác minh" (TT_03) quá 30 ngày sang "Đã được ẩn" (TT_05)
 */
const autoExpireVerificationStatus = (db, now = Date.now()) => {
    if (!db || !db.BaoNhat) return;
    const dataFolderPath = path.join(__dirname, '../../database/records');

    Object.values(db.BaoNhat).forEach(item => {
        if (item.TT_id === 'TT_03') {
            const verificationStartTime = Number(item.BN_ThoiGianXacMinh || item.BN_ThoiGianDang || 0);
            if (verificationStartTime > 0 && (now - verificationStartTime) >= THIRTY_DAYS_MS) {
                item.TT_id = 'TT_05';
                item.BN_ThoiGianAn = now;
                saveRecord(dataFolderPath, 'BaoNhat', item.BN_id, item, db);
                console.log(`[AutoExpire] Bài đăng ${item.BN_id} đã ở trạng thái "Đang xác minh" quá 30 ngày, tự động chuyển sang "Đã được ẩn" (TT_05).`);
            }
        }
    });
};

/**
 * Tạo yêu cầu xác minh nhận đồ
 */
const createVerificationRequest = (db, reqBody, reqFile) => {
    if (!db || !db.BaoNhat) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    const dataFolderPath = path.join(__dirname, '../../database/records');
    const payload = readPayload(reqBody);

    const rawBnId = String(payload.bnId || payload.itemId || '').trim();
    // Loại bỏ tiền tố 'find-' nếu gửi từ phía giao diện find
    const bnId = rawBnId.startsWith('find-') ? rawBnId.slice(5) : rawBnId;

    const answer = String(payload.answer || payload.CauTraLoiXacMinh || '').trim();
    const message = String(payload.message || payload.LoiNhan || '').trim();
    const phone = String(payload.phoneNumber || payload.phone || payload.SoDienThoai || '').replace(/\s+/g, '');
    let ndId = String(payload.ndId || payload.ND_id || '').trim();

    if (!bnId) {
        throw createError('Vui lòng cung cấp mã bài đăng báo nhặt đồ.');
    }

    const foundItem = db.BaoNhat[bnId] || Object.values(db.BaoNhat).find(item => item.BN_id === bnId);
    if (!foundItem) {
        throw createError(`Không tìm thấy bài đăng báo nhặt với mã [${bnId}].`, 404);
    }

    if (!answer) {
        throw createError('Vui lòng nhập câu trả lời cho câu hỏi xác minh.');
    }

    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
        throw createError('Số điện thoại liên hệ phải gồm 10 đến 11 chữ số.');
    }

    // Nếu không truyền người dùng, tìm người dùng mặc định hoặc lấy từ danh sách
    if (!ndId) {
        const users = Object.keys(db.NguoiDung || {});
        ndId = users[0] || 'B2405015';
    }

    const ycId = `YC_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    let proofImageUrl = '';

    if (reqFile) {
        const haId = `HA_${ycId}`;
        const imageRecord = {
            HA_id: haId,
            HA_URL: `/uploads/${reqFile.filename}`,
            HA_Ten: reqFile.originalname,
            YC_id: ycId
        };
        saveOrThrow(dataFolderPath, 'HinhAnh', haId, imageRecord, db);
        proofImageUrl = `/uploads/${reqFile.filename}`;
    }

    const ycRecord = {
        YC_id: ycId,
        BN_id: foundItem.BN_id,
        ND_id: ndId,
        CauTraLoiXacMinh: answer,
        LoiNhan: message,
        SoDienThoai: phone,
        HinhAnhMinhChung: proofImageUrl,
        ThoiGianYeuCau: Date.now(),
        TrangThai: 'ChoXacNhan',
        DuocChapNhan: false
    };

    saveOrThrow(dataFolderPath, 'YeucauNhanDo', ycId, ycRecord, db);

    return {
        request: ycRecord,
        foundItem
    };
};

/**
 * Lấy danh sách các yêu cầu xác minh của một bài đăng báo nhặt
 */
const getRequestsByFoundItem = (db, rawBnId) => {
    if (!db || !db.BaoNhat) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    const bnId = rawBnId.startsWith('find-') ? rawBnId.slice(5) : rawBnId;
    const foundItem = db.BaoNhat[bnId] || Object.values(db.BaoNhat).find(item => item.BN_id === bnId);
    if (!foundItem) {
        throw createError(`Không tìm thấy bài đăng báo nhặt với mã [${bnId}].`, 404);
    }

    const requestsTable = db.YeucauNhanDo || {};
    const requests = Object.values(requestsTable)
        .filter(req => req.BN_id === foundItem.BN_id)
        .sort((a, b) => (b.ThoiGianYeuCau || 0) - (a.ThoiGianYeuCau || 0))
        .map(req => {
            const user = db.NguoiDung ? db.NguoiDung[req.ND_id] || Object.values(db.NguoiDung).find(u => u.ND_id === req.ND_id) : null;
            return {
                id: req.YC_id,
                bnId: req.BN_id,
                studentId: req.ND_id,
                studentName: user?.ND_HoTen || 'Sinh viên',
                studentMssv: req.ND_id,
                answer: req.CauTraLoiXacMinh,
                message: req.LoiNhan || '',
                phone: req.SoDienThoai,
                proofImage: req.HinhAnhMinhChung || '',
                requestedAt: req.ThoiGianYeuCau,
                isAccepted: Boolean(req.DuocChapNhan),
                status: req.TrangThai || (req.DuocChapNhan ? 'DaChapNhan' : 'ChoXacNhan')
            };
        });

    const allImages = db.HinhAnh
        ? Object.values(db.HinhAnh).filter(h => h.BN_id === foundItem.BN_id || h.HA_id === foundItem.HA_id)
        : [];
    let imageUrls = allImages.map(img => img.HA_URL).filter(Boolean);
    if (!imageUrls.length && foundItem.HA_id && db.HinhAnh && db.HinhAnh[foundItem.HA_id]) {
        imageUrls.push(db.HinhAnh[foundItem.HA_id].HA_URL);
    }
    imageUrls = [...new Set(imageUrls)];

    const statusRecord = db.TrangThaiBaoNhat ? (db.TrangThaiBaoNhat[foundItem.TT_id] || Object.values(db.TrangThaiBaoNhat).find(s => s.TT_id === foundItem.TT_id)) : null;
    const loc = foundItem.DD_id && db.DiaDiem ? (db.DiaDiem[foundItem.DD_id] || Object.values(db.DiaDiem).find(d => d.DD_id === foundItem.DD_id)) : null;
    const building = loc && db.Toa ? (db.Toa[loc.Toa_ID] || Object.values(db.Toa).find(t => t.Toa_ID === loc.Toa_ID)) : null;
    const locText = loc?.DD_MoTa || (building ? `${building.Toa_Ten || loc.Toa_ID}` : 'Khu II - Đại học Cần Thơ');

    return {
        foundItem: {
            id: foundItem.BN_id,
            title: foundItem.BN_TieuDe,
            description: foundItem.BN_MoTa,
            question: foundItem.BN_CauHoiXacMinh,
            foundAt: foundItem.BN_ThoiGianNhat,
            postedAt: foundItem.BN_ThoiGianDang,
            storage: foundItem.BN_NoiLuuGiu,
            locationText: locText,
            statusId: foundItem.TT_id,
            statusName: statusRecord?.TT_Ten || 'Đang giữ đồ',
            imageUrl: imageUrls[0] || '',
            thumbnails: imageUrls,
            hasMultipleImages: imageUrls.length > 1,
            acceptedYcId: foundItem.BN_Accepted_YC_id || ''
        },
        requests
    };
};

/**
 * Lấy danh sách các bài đăng báo nhặt và yêu cầu của người đăng theo 4 phân đoạn
 */
const getOwnerRequestsOverview = (db, ndId = null, now = Date.now()) => {
    if (!db || !db.BaoNhat) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    // Tự động quét cập nhật các bài quá hạn 30 ngày ở trạng thái TT_03
    autoExpireVerificationStatus(db, now);

    const items = Object.values(db.BaoNhat).filter(item => {
        if (!ndId) return true;
        return item.ND_id === ndId;
    });

    const requestsTable = db.YeucauNhanDo || {};
    const allRequests = Object.values(requestsTable);

    const holdingItems = [];
    const inProgressItems = [];
    const completedItems = [];
    const expiredItems = [];

    items.forEach(item => {
        const itemRequests = allRequests.filter(r => r.BN_id === item.BN_id);
        const image = db.HinhAnh ? (db.HinhAnh[item.HA_id] || Object.values(db.HinhAnh).find(h => h.HA_id === item.HA_id || h.BN_id === item.BN_id)) : null;
        const statusRecord = db.TrangThaiBaoNhat ? (db.TrangThaiBaoNhat[item.TT_id] || Object.values(db.TrangThaiBaoNhat).find(s => s.TT_id === item.TT_id)) : null;
        const acceptedReq = itemRequests.find(r => r.DuocChapNhan === true || r.YC_id === item.BN_Accepted_YC_id);
        const receiver = acceptedReq && db.NguoiDung ? (db.NguoiDung[acceptedReq.ND_id] || Object.values(db.NguoiDung).find(u => u.ND_id === acceptedReq.ND_id)) : null;

        const formattedItem = {
            id: item.BN_id,
            title: item.BN_TieuDe,
            description: item.BN_MoTa,
            foundAt: item.BN_ThoiGianNhat,
            postedAt: item.BN_ThoiGianDang,
            storage: item.BN_NoiLuuGiu,
            statusId: item.TT_id,
            statusName: statusRecord?.TT_Ten || 'Sinh viên đang giữ',
            imageUrl: image?.HA_URL || '',
            requestCount: itemRequests.filter(r => !r.DuocChapNhan).length,
            totalRequests: itemRequests.length,
            acceptedRequest: acceptedReq ? {
                id: acceptedReq.YC_id,
                studentId: acceptedReq.ND_id,
                studentName: receiver?.ND_HoTen || 'Sinh viên nhận lại',
                studentMssv: acceptedReq.ND_id,
                phone: acceptedReq.SoDienThoai,
                message: acceptedReq.LoiNhan || '',
                requestedAt: acceptedReq.ThoiGianYeuCau
            } : null
        };

        if (item.TT_id === 'TT_03') {
            // Đang xác minh -> Những món đồ đang xử lý
            inProgressItems.push(formattedItem);
        } else if (item.TT_id === 'TT_04') {
            // Đã trao trả -> Những món đồ nhặt được đã trao trả thành công
            completedItems.push(formattedItem);
        } else if (item.TT_id === 'TT_05') {
            // Đã được ẩn -> Những món đồ nhặt được quá hạn
            expiredItems.push(formattedItem);
        } else {
            // TT_01 ("Sinh viên đang giữ") hoặc TT_02 ("PCTSV đang giữ") -> Những món đồ nhặt được
            holdingItems.push(formattedItem);
        }
    });

    return {
        holdingItems,
        inProgressItems,
        completedItems,
        expiredItems
    };
};

/**
 * Chấp nhận một yêu cầu xác minh:
 * - Cập nhật yêu cầu: DuocChapNhan = true
 * - Cập nhật bài đăng: TT_id = 'TT_03' (Đang xác minh)
 * - Món đồ chuyển xuống "Những món đồ đang xử lý"
 */
const acceptVerificationRequest = (db, ycId, rawBnId) => {
    if (!db || !db.BaoNhat || !db.YeucauNhanDo) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    const dataFolderPath = path.join(__dirname, '../../database/records');
    const bnId = rawBnId.startsWith('find-') ? rawBnId.slice(5) : rawBnId;

    const request = db.YeucauNhanDo[ycId] || Object.values(db.YeucauNhanDo).find(r => r.YC_id === ycId);
    if (!request) {
        throw createError(`Không tìm thấy yêu cầu xác minh với mã [${ycId}].`, 404);
    }

    const foundItem = db.BaoNhat[bnId] || Object.values(db.BaoNhat).find(item => item.BN_id === bnId);
    if (!foundItem) {
        throw createError(`Không tìm thấy bài đăng báo nhặt với mã [${bnId}].`, 404);
    }

    const now = Date.now();

    // 1. Cập nhật yêu cầu này thành được chấp nhận
    request.DuocChapNhan = true;
    request.TrangThai = 'DaChapNhan';
    request.ThoiGianChapNhan = now;
    saveOrThrow(dataFolderPath, 'YeucauNhanDo', request.YC_id, request, db);

    // 2. Cập nhật bài báo nhặt sang trạng thái "Đang xác minh" (TT_03)
    foundItem.TT_id = 'TT_03';
    foundItem.BN_ThoiGianXacMinh = now;
    foundItem.BN_Accepted_YC_id = request.YC_id;
    foundItem.BN_NguoiNhan_ND_id = request.ND_id;
    saveOrThrow(dataFolderPath, 'BaoNhat', foundItem.BN_id, foundItem, db);

    return {
        message: 'Đã chấp nhận yêu cầu xác minh thành công. Bài đăng đã chuyển sang trạng thái "Đang xác minh".',
        foundItem,
        request
    };
};

/**
 * Xác nhận hoàn tất trao trả ngoài đời thực:
 * - Chuyển trạng thái sang TT_04 (Đã trao trả)
 * - Chuyển bài đăng xuống "Những món đồ nhặt được đã trao trả thành công"
 */
const confirmHandover = (db, rawBnId) => {
    if (!db || !db.BaoNhat) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    const dataFolderPath = path.join(__dirname, '../../database/records');
    const bnId = rawBnId.startsWith('find-') ? rawBnId.slice(5) : rawBnId;

    const foundItem = db.BaoNhat[bnId] || Object.values(db.BaoNhat).find(item => item.BN_id === bnId);
    if (!foundItem) {
        throw createError(`Không tìm thấy bài đăng báo nhặt với mã [${bnId}].`, 404);
    }

    foundItem.TT_id = 'TT_04';
    foundItem.BN_ThoiGianTraoTra = Date.now();
    saveOrThrow(dataFolderPath, 'BaoNhat', foundItem.BN_id, foundItem, db);

    return {
        message: 'Đã xác nhận hoàn tất trao trả thành công trên hệ thống.',
        foundItem
    };
};

/**
 * Hủy trao trả:
 * - Trả bài đăng về lại trạng thái ban đầu (TT_01 hoặc TT_02)
 * - Bỏ chấp nhận yêu cầu
 */
const cancelHandover = (db, rawBnId, reason = '') => {
    if (!db || !db.BaoNhat) {
        throw createError('Hệ thống cơ sở dữ liệu chưa sẵn sàng.', 500);
    }

    const dataFolderPath = path.join(__dirname, '../../database/records');
    const bnId = rawBnId.startsWith('find-') ? rawBnId.slice(5) : rawBnId;

    const foundItem = db.BaoNhat[bnId] || Object.values(db.BaoNhat).find(item => item.BN_id === bnId);
    if (!foundItem) {
        throw createError(`Không tìm thấy bài đăng báo nhặt với mã [${bnId}].`, 404);
    }

    const isPctsv = String(foundItem.BN_NoiLuuGiu || '').toLowerCase().includes('pctsv');
    foundItem.TT_id = isPctsv ? 'TT_02' : 'TT_01';
    delete foundItem.BN_ThoiGianXacMinh;

    const acceptedYcId = foundItem.BN_Accepted_YC_id;
    delete foundItem.BN_Accepted_YC_id;
    delete foundItem.BN_NguoiNhan_ND_id;
    saveOrThrow(dataFolderPath, 'BaoNhat', foundItem.BN_id, foundItem, db);

    if (acceptedYcId && db.YeucauNhanDo && db.YeucauNhanDo[acceptedYcId]) {
        const req = db.YeucauNhanDo[acceptedYcId];
        req.DuocChapNhan = false;
        req.TrangThai = 'DaHuy';
        req.LyDoHuy = reason;
        saveOrThrow(dataFolderPath, 'YeucauNhanDo', req.YC_id, req, db);
    }

    return {
        message: 'Đã hủy trao trả. Bài đăng đã được khôi phục về trạng thái đang giữ hộ.',
        foundItem
    };
};

/**
 * Lấy danh sách kết quả ghép nối cho các bài đăng báo mất của người dùng (>= 0.90 điểm)
 */
const getLostItemMatches = (db, ndId = null) => {
    if (!db || !db.BaoMat || !db.TuongThich || !ndId) {
        return [];
    }

    const lossItems = Object.values(db.BaoMat).filter(bm => {
        if (bm.BM_TimThay) return false;
        return String(bm.ND_id || '') === String(ndId);
    });

    const allMatches = Object.values(db.TuongThich);
    const results = [];

    lossItems.forEach(bm => {
        const matchesForBm = allMatches.filter(tc => tc.BM_id === bm.BM_id && Number(tc.DoTuongThich) >= 0.90);
        if (!matchesForBm.length) return;

        matchesForBm.sort((a, b) => Number(b.DoTuongThich) - Number(a.DoTuongThich));

        const matchedFoundItems = matchesForBm.map(tc => {
            const bn = (db.BaoNhat && db.BaoNhat[tc.BN_id]) || (db.BaoNhat && Object.values(db.BaoNhat).find(item => item.BN_id === tc.BN_id));
            const imageRecords = bn && db.HinhAnh
                ? Object.values(db.HinhAnh).filter(h => h.HA_id === bn.HA_id || h.BN_id === bn.BN_id)
                : [];
            const imageUrls = [...new Set(imageRecords.map(image => image.HA_URL).filter(Boolean))];
            const loc = bn && db.DiaDiem ? (db.DiaDiem[bn.DD_id] || Object.values(db.DiaDiem).find(d => d.DD_id === bn.DD_id)) : null;
            const building = loc && db.Toa ? (db.Toa[loc.Toa_ID] || Object.values(db.Toa).find(t => t.Toa_ID === loc.Toa_ID)) : null;
            const floor = loc && db.Tang ? (db.Tang[loc.Tang_id] || Object.values(db.Tang).find(f => f.Tang_id === loc.Tang_id)) : null;
            const room = loc && db.Phong ? (db.Phong[loc.Phong_id] || Object.values(db.Phong).find(r => r.Phong_id === loc.Phong_id)) : null;
            const category = bn && db.LoaiDo
                ? (db.LoaiDo[bn.LD_id] || Object.values(db.LoaiDo).find(item => item.LD_id === bn.LD_id))
                : null;
            const status = bn && db.TrangThaiBaoNhat
                ? (db.TrangThaiBaoNhat[bn.TT_id] || Object.values(db.TrangThaiBaoNhat).find(item => item.TT_id === bn.TT_id))
                : null;

            return {
                tcId: tc.TC_id,
                score: Number(tc.DoTuongThich),
                scorePercent: Math.round(Number(tc.DoTuongThich) * 100),
                foundItem: bn ? {
                    id: bn.BN_id,
                    title: bn.BN_TieuDe,
                    description: bn.BN_MoTa,
                    foundAt: bn.BN_ThoiGianNhat,
                    postedAt: bn.BN_ThoiGianDang,
                    category: category?.LD_Ten || 'Đồ vật',
                    status: status?.TT_Ten || 'Đang giữ đồ',
                    storage: bn.BN_NoiLuuGiu,
                    imageUrl: imageUrls[0] || '',
                    imageUrls,
                    buildingId: loc?.Toa_ID || '',
                    buildingName: building?.Toa_Ten || loc?.Toa_ID || '',
                    locationText: loc?.DD_MoTa || '',
                    floorNumber: Number.isFinite(Number(floor?.Tang)) ? Number(floor.Tang) : 1,
                    roomName: room?.Phong || ''
                } : null
            };
        }).filter(m => m.foundItem !== null);

        if (!matchedFoundItems.length) return;

        // Trích xuất tiêu đề từ mô tả bài báo mất.
        let title = 'Món đồ thất lạc';
        const matchTitle = String(bm.BM_MoTa || '').match(/(?:^| - )Tên đồ vật:\s*(.*?)(?= - |$)/);
        if (matchTitle && matchTitle[1]) {
            title = matchTitle[1].trim();
        } else if (bm.BM_MoTa) {
            title = bm.BM_MoTa.split('-')[0].trim();
            if (title.length > 50) title = title.slice(0, 50) + '...';
        }

        const image = db.HinhAnh ? (db.HinhAnh[bm.HA_id] || Object.values(db.HinhAnh).find(h => h.HA_id === bm.HA_id)) : null;
        const lossLoc = getLostLocation(db, bm);

        results.push({
            bmId: bm.BM_id,
            title,
            description: bm.BM_MoTa || '',
            lostAt: bm.BM_ThoiGianMat || bm.BM_ThoiGianDang,
            postedAt: bm.BM_ThoiGianDang,
            imageUrl: image?.HA_URL || '',
            buildingId: lossLoc?.Toa_ID || '',
            matchCount: matchedFoundItems.length,
            topScore: matchedFoundItems[0].score,
            topScorePercent: matchedFoundItems[0].scorePercent,
            topFoundItem: matchedFoundItems[0].foundItem,
            matchedItems: matchedFoundItems
        });
    });

    results.sort((a, b) => b.topScore - a.topScore);
    return results;
};

module.exports = {
    createVerificationRequest,
    getRequestsByFoundItem,
    getOwnerRequestsOverview,
    acceptVerificationRequest,
    confirmHandover,
    cancelHandover,
    autoExpireVerificationStatus,
    getLostItemMatches,
    THIRTY_DAYS_MS
};
