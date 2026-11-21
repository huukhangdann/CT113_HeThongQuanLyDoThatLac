const path = require('path');
const { saveRecord } = require('../../database/engine/write');
const { FeatureScoreVector } = require('../utils/featureScoreVector');
const { getLostLocation } = require('../utils/lostItemLocation');
const { LostAndFoundNeuralMatcher } = require('../utils/Matrix');

const getLossDescription = lossItem => {
    const description = String(lossItem.BM_MoTa || '');
    const title = description.match(/(?:^| - )Tên đồ vật:\s*(.*?)(?= - |$)/i)?.[1];
    const details = description.match(
        /(?:^| - )Mô tả:\s*(.*?)(?= - (?:Số điện thoại liên hệ|Tên liên hệ|Email liên hệ):|$)/i
    )?.[1];
    return [title, details].filter(Boolean).join(' ') || description;
};

const scoreFoundAndLostItems = (db, foundItem, lossItem) => {
    const foundLoc = (db.DiaDiem && db.DiaDiem[foundItem.DD_id]) || {};
    const lossLoc = getLostLocation(db, lossItem);
    const matcher = new LostAndFoundNeuralMatcher();
    const vector = FeatureScoreVector(
        {
            location: [foundLoc.Toa_ID, foundLoc.Tang_id, foundLoc.Phong_id].filter(Boolean),
            time: Number(foundItem.BN_ThoiGianNhat || foundItem.BN_ThoiGianDang || Date.now()),
            colorprimary: foundItem.BN_MauChuDao || '#000000',
            colorsecondary: [foundItem.BN_MauPhu1, foundItem.BN_MauPhu2, foundItem.BN_MauPhu3].filter(Boolean),
            description: `${foundItem.BN_TieuDe || ''} ${foundItem.BN_MoTa || ''}`
        },
        {
            location: [lossLoc.Toa_ID, lossLoc.Tang_id, lossLoc.Phong_id].filter(Boolean),
            time: Number(lossItem.BM_ThoiGianMat || lossItem.BM_ThoiGianDang || Date.now()),
            colorprimary: lossItem.BM_MauChuDao || '#000000',
            colorsecondary: [lossItem.BM_MauPhu1, lossItem.BM_MauPhu2, lossItem.BM_MauPhu3].filter(Boolean),
            description: getLossDescription(lossItem)
        }
    );

    return matcher.predict(...vector);
};

const computeAndSaveMatches = (db, foundItem, dataFolderPath) => {
    if (!db || !db.BaoMat) return [];
    const lossItems = Object.values(db.BaoMat).filter(item =>
        !item.BM_TimThay
        && String(item.LD_id || '').trim().toUpperCase() === String(foundItem.LD_id || '').trim().toUpperCase()
    );
    if (!lossItems.length) return [];

    const matches = [];

    lossItems.forEach(lossItem => {
        const score = scoreFoundAndLostItems(db, foundItem, lossItem);

        if (score >= 0.90) {
            matches.push({ lossItem, score });
        }
    });

    matches.sort((a, b) => b.score - a.score);
    const top5 = matches.slice(0, 5);

    top5.forEach((item, index) => {
        const tcId = `TC_${Date.now()}_${index + 1}_${Math.random().toString(36).slice(2, 6)}`;
        const tcPayload = {
            TC_id: tcId,
            BM_id: item.lossItem.BM_id,
            BN_id: foundItem.BN_id,
            DoTuongThich: Number(item.score.toFixed(4)),
            ThoiGianTao: Date.now()
        };
        if (!saveRecord(dataFolderPath, 'TuongThich', tcId, tcPayload, db)) {
            throw createError('Không thể lưu kết quả ghép nối.', 500);
        }
    });

    console.log(`[Neural Matcher] Đã ghép nối bài nhặt [${foundItem.BN_id}] với ${top5.length} bài mất có độ tương thích >= 0.90!`);
    return top5;
};

exports.scoreFoundAndLostItems = scoreFoundAndLostItems;

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const readPayload = reqBody => {
    if (typeof reqBody.data !== 'string') return reqBody;

    try {
        const payload = JSON.parse(reqBody.data);
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Dữ liệu gửi lên phải là một JSON object.');
        }
        return payload;
    } catch (error) {
        throw createError(`Dữ liệu JSON không hợp lệ: ${error.message}`);
    }
};

const saveOrThrow = (dataFolderPath, tableName, recordId, payload, db) => {
    if (!saveRecord(dataFolderPath, tableName, recordId, payload, db)) {
        throw createError(`Không thể lưu dữ liệu vào bảng ${tableName}.`, 500);
    }
};

exports.createFoundItemRecord = (db, reqBody, reqFiles) => {
    const dataFolderPath = path.join(__dirname, '../../database/records');
    const payload = readPayload(reqBody || {});

    const title = String(payload.tieuDe || '').trim();
    const ndId = String(payload.ndId || '').trim();
    const ldId = String(payload.ldId || '').trim();
    const toaId = String(payload.toaId || '').trim();
    const tangId = String(payload.tangId || '').trim();
    const phongId = String(payload.phongId || '').trim();
    const contactPhone = String(payload.contactPhone || '').replace(/\s+/g, '');
    const contactName = String(payload.contactName || '').trim();
    const contactEmail = String(payload.contactEmail || '').trim();
    const timeNhat = typeof payload.timeNhat === 'number'
        ? payload.timeNhat
        : typeof payload.timeNhat === 'string' && payload.timeNhat.trim()
            ? Number(payload.timeNhat)
            : NaN;
    const images = Array.isArray(reqFiles) ? reqFiles : [];

    if (!title) throw createError('Vui lòng nhập tiêu đề bài đăng.');
    if (!ndId) throw createError('Thiếu mã người dùng đăng tin.');
    if (!Number.isFinite(timeNhat) || timeNhat <= 0) {
        throw createError('Thời gian nhặt không hợp lệ.');
    }
    if (!/^[0-9]{10,11}$/.test(contactPhone)) {
        throw createError('Số điện thoại liên hệ phải gồm 10-11 chữ số.');
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        throw createError('Email liên hệ không hợp lệ.');
    }
    if (!String(payload.cauHoiXacMinh || '').trim()) {
        throw createError('Thiếu câu hỏi xác minh quyền sở hữu.');
    }
    if (!images.length || images.length > 4) {
        throw createError('Bài đăng cần từ 1 đến 4 hình ảnh.');
    }

    const user = Object.values(db.NguoiDung || {}).find(
        record => String(record.ND_id || '') === ndId
    );
    if (!user) throw createError('Mã người dùng không tồn tại trong hệ thống.');

    const category = Object.values(db.LoaiDo || {}).find(
        record => String(record.LD_id || '').trim().toUpperCase() === ldId.toUpperCase()
    );
    if (!category) {
        throw createError('Loại đồ vật không hợp lệ.');
    }

    const building = Object.values(db.Toa || {}).find(
        record => String(record.Toa_ID || '') === toaId
    );
    if (!building) throw createError('Tòa nhà không tồn tại trong hệ thống.');

    const normalizedToaId = toaId.replace(/[^A-Za-z0-9]/g, '_');
    const floorPrefix = `TANG_${normalizedToaId}_`;
    const roomPrefix = `PHONG_${normalizedToaId}_`;
    const floorNumberText = tangId.startsWith(floorPrefix)
        ? tangId.slice(floorPrefix.length)
        : '';
    const floorNumber = Number(floorNumberText);
    if (!Number.isInteger(floorNumber) || floorNumber < 0 || !phongId.startsWith(roomPrefix)) {
        throw createError('Tầng hoặc phòng không thuộc tòa nhà đã chọn.');
    }

    const roomName = String(payload.roomName || '').trim();
    const locationText = String(payload.locationText || '').trim();
    const question = String(payload.cauHoiXacMinh).trim();
    const custody = String(payload.noiLuuGiu || '').trim();
    const primaryColor = String(payload.mauChuDao || '').trim();
    if (!/^#[0-9a-f]{6}$/i.test(primaryColor)) {
        throw createError('Màu chủ đạo không hợp lệ.');
    }
    if (!roomName || !locationText || !custody) {
        throw createError('Thiếu địa điểm hoặc nơi lưu giữ đồ vật.');
    }

    const statusId = String(payload.ttId || 'TT_01').trim();
    if (!db.TrangThaiBaoNhat || !db.TrangThaiBaoNhat[statusId]) {
        throw createError('Trạng thái bài đăng không tồn tại.', 500);
    }

    const bnId = `BN_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ddId = `DD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const floorRecord = {
        ...(db.Tang && db.Tang[tangId] ? db.Tang[tangId] : {}),
        Tang_id: tangId,
        Tang: floorNumber,
        Toa_ID: toaId
    };
    const roomRecord = {
        ...(db.Phong && db.Phong[phongId] ? db.Phong[phongId] : {}),
        Phong_id: phongId,
        Phong: roomName,
        Tang_id: tangId
    };
    const locationRecord = {
        DD_id: ddId,
        DO_id: ddId,
        Toa_ID: toaId,
        Tang_id: tangId,
        Phong_id: phongId,
        DD_MoTa: locationText
    };

    saveOrThrow(dataFolderPath, 'Tang', tangId, floorRecord, db);
    saveOrThrow(dataFolderPath, 'Phong', phongId, roomRecord, db);
    saveOrThrow(dataFolderPath, 'DiaDiem', ddId, locationRecord, db);

    const imageIds = [];
    images.forEach((file, index) => {
        const imageId = `HA_${bnId}_${index + 1}`;
        const imageRecord = {
            HA_id: imageId,
            HA_URL: `/uploads/${file.filename}`,
            HA_Ten: file.originalname,
            BN_id: bnId
        };
        saveOrThrow(dataFolderPath, 'HinhAnh', imageId, imageRecord, db);
        imageIds.push(imageId);
    });

    const foundItem = {
        BN_id: bnId,
        BN_TieuDe: title,
        BN_ThoiGianNhat: timeNhat,
        BN_MoTa: String(payload.moTa || '').trim(),
        BN_ThoiGianDang: now,
        BN_CauHoiXacMinh: question,
        BN_MauChuDao: primaryColor,
        BN_MauPhu1: String(payload.mauPhu1 || '').trim(),
        BN_MauPhu2: String(payload.mauPhu2 || '').trim(),
        BN_MauPhu3: String(payload.mauPhu3 || '').trim(),
        BN_TenNguoiLienHe: contactName || user.ND_HoTen || '',
        BN_EmailLienHe: contactEmail || user.ND_email || '',
        BN_SDTLienHe: contactPhone,
        BN_NoiLuuGiu: custody,
        HA_id: imageIds[0],
        ND_id: ndId,
        DD_id: ddId,
        LD_id: ldId,
        TT_id: statusId
    };

    saveOrThrow(dataFolderPath, 'BaoNhat', bnId, foundItem, db);

    // Chấm điểm ghép nối AI giữa bài nhặt vừa tạo và tất cả bài báo mất
    const matches = computeAndSaveMatches(db, foundItem, dataFolderPath);

    return {
        foundItem,
        uploadedImagesCount: imageIds.length,
        imageIds,
        matchesCount: matches.length
    };
};

exports.backfillMissingMatches = db => {
    if (!db || !db.BaoNhat || !db.BaoMat) return 0;

    const dataFolderPath = path.join(__dirname, '../../database/records');
    let newMatchesCount = 0;
    Object.values(db.BaoNhat).forEach(foundItem => {
        const alreadyScored = Object.values(db.TuongThich || {}).some(
            match => match.BN_id === foundItem.BN_id
        );
        if (!alreadyScored) {
            newMatchesCount += computeAndSaveMatches(db, foundItem, dataFolderPath).length;
        }
    });
    return newMatchesCount;
};
