const path = require('path');
const { saveRecord, deleteRecord } = require('../../database/engine/write');
const foundItemSearchService = require('./foundItemSearchService');
const { isAdmin } = require('../utils/adminToken');

const dataFolderPath = path.join(__dirname, '../../database/records');
const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const normalizeBuildingId = value => normalizeText(value).replace(/^toa/, '');
const STATUS_TO_ID = {
    student_holding: 'TT_01',
    pctsv_holding: 'TT_02',
    verifying: 'TT_03',
    returned: 'TT_04',
    hidden: 'TT_05'
};
const ID_TO_STATUS = Object.fromEntries(
    Object.entries(STATUS_TO_ID).map(([status, id]) => [id, status])
);

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const findRecord = (records, id, idField) => {
    const table = records || {};
    return table[id] || Object.values(table).find(record => String(record[idField] || '') === String(id)) || null;
};

const formatDate = timestamp => {
    const value = Number(timestamp);
    return Number.isFinite(value) && value > 0
        ? new Date(value).toLocaleString('vi-VN')
        : '';
};

const getImageUrl = (db, record) => {
    const image = findRecord(db.HinhAnh, record.HA_id, 'HA_id');
    return String(image?.HA_URL || record.imageUrl || '');
};

const getFoundPosts = db => {
    const items = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
        const result = foundItemSearchService.searchFoundItems(db, {
            sort: 'newest',
            page: String(page),
            pageSize: '50'
        });
        items.push(...result.items);
        totalPages = result.totalPages;
        page += 1;
    }

    return items.map(item => {
        const record = findRecord(db.BaoNhat, item.id, 'BN_id');
        return {
            id: item.id,
            title: item.title,
            category: item.category,
            color: item.colors[0] || '',
            type: 'found',
            reporterName: item.posterName || 'Người dùng',
            reporterId: record?.ND_id || '',
            isPctsv: item.statusId === 'TT_02' || isAdmin(findRecord(db.NguoiDung, record?.ND_id, 'ND_id')),
            location: item.location,
            time: formatDate(item.postedAt || item.foundAt),
            postedAt: Number(item.postedAt || item.foundAt) || 0,
            status: ID_TO_STATUS[item.statusId] || 'student_holding',
            previousStatus: ID_TO_STATUS[record?.BN_PreviousStatus] || 'student_holding',
            storage: item.storage,
            photo: item.imageUrl,
            note: item.description,
            question: item.question,
            reportReason: record?.BN_ReportReason || '',
            reportCount: Number(record?.BN_ReportCount) || 0,
            reportedBy: record?.BN_ReportedBy || '',
            hiddenReason: record?.BN_HiddenReason || '',
            hiddenAt: formatDate(record?.BN_HiddenAt)
        };
    });
};

const extractLossField = (description, label, nextLabels) => {
    const next = nextLabels.join('|');
    const pattern = new RegExp(`(?:^| - )${label}:\\s*(.*?)(?= - (?:${next}):|$)`, 'i');
    return String(description || '').match(pattern)?.[1]?.trim() || '';
};

const getLostPosts = db => Object.values(db.BaoMat || {}).map(record => {
    const user = findRecord(db.NguoiDung, record.ND_id, 'ND_id');
    const category = findRecord(db.LoaiDo, record.LD_id, 'LD_id');
    const description = String(record.BM_MoTa || '');
    const location = String(
        record.BM_DiaDiem
        || extractLossField(description, 'Địa điểm nghi mất', ['Mô tả', 'Số điện thoại liên hệ', 'Tên liên hệ', 'Email liên hệ'])
    );
    const status = record.BM_AdminStatus
        || (record.BM_TimThay ? 'returned' : 'student_holding');

    return {
        id: String(record.BM_id || ''),
        title: extractLossField(description, 'Tên đồ vật', ['Địa điểm nghi mất', 'Mô tả'])
            || description.slice(0, 100),
        category: String(category?.LD_Ten || 'Chưa phân loại'),
        color: String(record.BM_MauChuDao || ''),
        type: 'lost',
        reporterName: String(user?.ND_HoTen || 'Người dùng'),
        reporterId: String(record.ND_id || ''),
        isPctsv: false,
        location,
        time: formatDate(record.BM_ThoiGianDang || record.BM_ThoiGianMat),
        postedAt: Number(record.BM_ThoiGianDang || record.BM_ThoiGianMat) || 0,
        status,
        previousStatus: record.BM_AdminPreviousStatus || 'student_holding',
        storage: '',
        photo: getImageUrl(db, record),
        note: extractLossField(description, 'Mô tả', ['Số điện thoại liên hệ', 'Tên liên hệ', 'Email liên hệ'])
            || description,
        question: '',
        reportReason: String(record.BM_AdminReportReason || ''),
        reportCount: Number(record.BM_AdminReportCount) || 0,
        reportedBy: String(record.BM_AdminReportedBy || ''),
        hiddenReason: String(record.BM_AdminHiddenReason || ''),
        hiddenAt: formatDate(record.BM_AdminHiddenAt)
    };
}).sort((left, right) => {
    const leftRecord = findRecord(db.BaoMat, left.id, 'BM_id');
    const rightRecord = findRecord(db.BaoMat, right.id, 'BM_id');
    return Number(rightRecord?.BM_ThoiGianDang || 0) - Number(leftRecord?.BM_ThoiGianDang || 0);
});

exports.listPosts = db => {
    if (!db?.BaoNhat || !db?.BaoMat) throw createError('Cơ sở dữ liệu bài đăng chưa sẵn sàng.', 500);
    return [...getFoundPosts(db), ...getLostPosts(db)]
        .sort((left, right) => {
            const leftRecord = findPostRecord(db, left.id)?.record || {};
            const rightRecord = findPostRecord(db, right.id)?.record || {};
            const leftTime = left.type === 'found' ? leftRecord.BN_ThoiGianDang : leftRecord.BM_ThoiGianDang;
            const rightTime = right.type === 'found' ? rightRecord.BN_ThoiGianDang : rightRecord.BM_ThoiGianDang;
            return Number(rightTime || 0) - Number(leftTime || 0);
        });
};

exports.getMetadata = db => {
    if (!db?.LoaiDo || !db?.Toa) throw createError('Cơ sở dữ liệu danh mục chưa sẵn sàng.', 500);
    return {
        categories: foundItemSearchService.getFoundItemCategories(db),
        buildings: Object.values(db.Toa)
        .map(building => ({
            id: String(building.Toa_ID || ''),
            name: String(building.Toa_Ten || building.Toa_ID || '')
        }))
        .filter(building => building.id)
        .sort((left, right) => left.name.localeCompare(right.name, 'vi'))
    };
};

exports.createPctsvPost = (db, adminUser, body, files) => {
    if (!db?.BaoNhat || !db?.NguoiDung || !db?.LoaiDo || !db?.Toa) {
        throw createError('Cơ sở dữ liệu bài đăng chưa sẵn sàng.', 500);
    }
    const form = body || {};
    const buildingId = String(form.toaId || '').trim();
    const floorValue = String(form.tangId || '').trim();
    const roomName = String(form.roomName || '').trim();
    const building = findRecord(db.Toa, buildingId, 'Toa_ID');
    const floorNumber = Number(floorValue);
    if (!building) throw createError('Tòa nhà không tồn tại trong hệ thống.');
    if (!Number.isInteger(floorNumber) || floorNumber < 0 || floorNumber > 20) {
        throw createError('Tầng không hợp lệ.');
    }
    if (!roomName) throw createError('Vui lòng chọn phòng hoặc vị trí nhặt.');

    const categoryText = String(form.ldId || '').trim();
    const category = findRecord(db.LoaiDo, categoryText, 'LD_id')
        || Object.values(db.LoaiDo || {}).find(
            item => normalizeText(item.LD_Ten) === normalizeText(categoryText)
        );
    if (!category) throw createError('Loại đồ vật không hợp lệ.');

    const normalizedToaId = String(building.Toa_ID).replace(/[^A-Za-z0-9]/g, '_');
    const floor = Object.values(db.Tang || {}).find(record =>
        normalizeBuildingId(record.Toa_ID) === normalizeBuildingId(building.Toa_ID)
        && Number(record.Tang) === floorNumber
    );
    const tangId = floor?.Tang_id || `TANG_${normalizedToaId}_${floorNumber}`;
    const room = Object.values(db.Phong || {}).find(record =>
        record.Tang_id === tangId && normalizeText(record.Phong) === normalizeText(roomName)
    );
    const roomSlug = `${floorNumber}_${normalizeText(roomName).toUpperCase() || 'LOCATION'}`;
    const phongId = room?.Phong_id || `PHONG_${normalizedToaId}_${roomSlug}`;
    const locationText = String(form.locationText || '').trim()
        || [building.Toa_Ten, floorNumber === 0 ? 'Tầng trệt' : `Tầng ${floorNumber}`, roomName].join(' - ');
    const timestamp = Date.parse(`${form.date}T${form.time}:00`);
    if (!Number.isFinite(timestamp)) throw createError('Ngày hoặc giờ nhặt không hợp lệ.');

    const foundItemService = require('./foundItemService');
    return foundItemService.createFoundItemRecord(db, {
        data: JSON.stringify({
            ...form,
            tieuDe: String(form.tieuDe || '').trim(),
            ndId: adminUser.ND_id,
            ldId: category.LD_id,
            toaId: building.Toa_ID,
            tangId,
            phongId,
            roomName,
            locationText,
            timeNhat: timestamp,
            ttId: 'TT_02',
            contactName: adminUser.ND_HoTen || 'Cán bộ PCTSV',
            contactEmail: adminUser.ND_email || '',
            contactPhone: adminUser.ND_SDT || '',
            noiLuuGiu: String(form.noiLuuGiu || '').trim()
        })
    }, files, { allowExternalImageUrl: true });
};

exports.listAccounts = db => {
    if (!db?.NguoiDung) throw createError('Cơ sở dữ liệu tài khoản chưa sẵn sàng.', 500);
    const returnedCounts = {};
    Object.values(db.BaoNhat || {}).forEach(item => {
        if (item.TT_id === 'TT_04' && item.ND_id) {
            returnedCounts[item.ND_id] = (returnedCounts[item.ND_id] || 0) + 1;
        }
    });

    return Object.values(db.NguoiDung || {})
        .map(user => {
            const admin = isAdmin(user);
            return {
                id: String(user.ND_id || ''),
                code: String(user.ND_id || ''),
                name: String(user.ND_HoTen || ''),
                role: admin ? 'admin' : 'student',
                dept: String(user.ND_DonVi || user.ND_Khoa || 'Trường Đại học Cần Thơ'),
                email: String(user.ND_email || ''),
                phone: String(user.ND_SDT || ''),
                points: admin ? null : Number(user.ND_DiemCong) || 0,
                returnedCount: returnedCounts[user.ND_id] || 0
            };
        })
        .sort((left, right) => right.points - left.points);
};

exports.createAccount = (db, body) => {
    if (!db?.NguoiDung) throw createError('Cơ sở dữ liệu tài khoản chưa sẵn sàng.', 500);
    const form = body || {};
    const code = String(form.code || '').trim();
    const name = String(form.name || '').trim();
    const password = String(form.password || '');
    const email = String(form.email || '').trim();
    const phone = String(form.phone || '').trim();
    const dept = String(form.dept || '').trim();
    const points = form.points === '' || form.points === null || form.points === undefined
        ? 0
        : Number(form.points);

    if (!code || !name) throw createError('Mã định danh và họ tên là bắt buộc.');
    if (!/^[\w.-]{3,32}$/i.test(code)) throw createError('Mã định danh không hợp lệ.');
    if (Object.values(db.NguoiDung || {}).some(
        user => String(user.ND_id || '').toLowerCase() === code.toLowerCase()
    )) {
        throw createError('Mã định danh đã tồn tại.');
    }
    if (password.length < 8) throw createError('Mật khẩu phải có ít nhất 8 ký tự.');
    if (!Number.isInteger(points) || points < 0 || points > 100) {
        throw createError('Điểm khởi tạo phải từ 0 đến 100.');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError('Email không hợp lệ.');

    const user = {
        ND_id: code,
        ND_HoTen: name,
        ND_email: email || `${code.toLowerCase()}@student.ctu.edu.vn`,
        ND_MatKhau: password,
        ND_SDT: phone,
        ND_DiemCong: points,
        ND_DonVi: dept || 'Trường Đại học Cần Thơ',
        VT_id: 'VT01'
    };
    if (!saveRecord(dataFolderPath, 'NguoiDung', code, user, db)) {
        throw createError('Không thể lưu tài khoản mới.', 500);
    }

    return {
        id: code,
        code,
        name,
        role: 'student',
        dept: user.ND_DonVi,
        email: user.ND_email,
        phone,
        points,
        returnedCount: 0
    };
};

const findPostRecord = (db, id) => {
    const found = findRecord(db.BaoNhat, id, 'BN_id');
    if (found) return { type: 'found', record: found, table: 'BaoNhat', idField: 'BN_id' };
    const lost = findRecord(db.BaoMat, id, 'BM_id');
    if (lost) return { type: 'lost', record: lost, table: 'BaoMat', idField: 'BM_id' };
    return null;
};

exports.updatePostStatus = (db, id, status, reason = '') => {
    const target = findPostRecord(db, id);
    if (!target) throw createError('Không tìm thấy bài đăng.', 404);
    if (!Object.prototype.hasOwnProperty.call(STATUS_TO_ID, status)) {
        throw createError('Trạng thái bài đăng không hợp lệ.');
    }

    const record = target.record;
    if (target.type === 'found') {
        if (status === 'hidden') {
            if (record.TT_id !== 'TT_05') record.BN_PreviousStatus = record.TT_id || 'TT_01';
            record.BN_HiddenReason = reason;
            record.BN_HiddenAt = Date.now();
            record.TT_id = 'TT_05';
        } else {
            record.TT_id = STATUS_TO_ID[status];
            delete record.BN_PreviousStatus;
            delete record.BN_HiddenReason;
            delete record.BN_HiddenAt;
            if (status === 'student_holding') {
                delete record.BN_ReportReason;
                delete record.BN_ReportCount;
                delete record.BN_ReportedBy;
                delete record.BN_AdminReportReason;
                delete record.BN_AdminReportCount;
                delete record.BN_AdminReportedBy;
            }
        }
    } else {
        if (status === 'hidden') {
            if (record.BM_AdminStatus !== 'hidden') {
                record.BM_AdminPreviousStatus = record.BM_AdminStatus || 'student_holding';
            }
            record.BM_AdminStatus = 'hidden';
            record.BM_AdminHiddenReason = reason;
            record.BM_AdminHiddenAt = Date.now();
        } else {
            record.BM_AdminStatus = status;
            delete record.BM_AdminPreviousStatus;
            delete record.BM_AdminHiddenReason;
            delete record.BM_AdminHiddenAt;
            if (status === 'student_holding') {
                delete record.BM_AdminReportReason;
                delete record.BM_AdminReportCount;
                delete record.BM_AdminReportedBy;
            }
        }
    }

    if (!saveRecord(dataFolderPath, target.table, record[target.idField], record, db)) {
        throw createError('Không thể lưu trạng thái bài đăng.', 500);
    }
    return { id, status };
};

const deleteMany = (db, tableName, shouldDelete) => {
    Object.entries(db[tableName] || {}).forEach(([recordId, record]) => {
        if (shouldDelete(record, recordId)
            && !deleteRecord(dataFolderPath, tableName, recordId, db)) {
            throw createError(`Không thể xóa dữ liệu liên quan khỏi bảng ${tableName}.`, 500);
        }
    });
};

exports.deletePost = (db, id) => {
    const target = findPostRecord(db, id);
    if (!target) throw createError('Không tìm thấy bài đăng.', 404);

    const relationField = target.type === 'found' ? 'BN_id' : 'BM_id';
    deleteMany(db, 'TuongThich', record => record[relationField] === id);

    if (target.type === 'found') {
        const requestIds = new Set(Object.entries(db.YeucauNhanDo || {})
            .filter(([, record]) => record.BN_id === id)
            .map(([recordId, record]) => record.YC_id || recordId));
        deleteMany(db, 'YeucauNhanDo', record => record.BN_id === id);
        deleteMany(db, 'HinhAnh', image => image.BN_id === id
            || target.record.HA_id && image.HA_id === target.record.HA_id
            || image.YC_id && requestIds.has(image.YC_id));
    } else {
        const imageEntry = Object.entries(db.HinhAnh || {}).find(
            ([recordId, image]) => recordId === target.record.HA_id || image.HA_id === target.record.HA_id
        );
        const image = imageEntry?.[1];
        const usedByOtherPost = Object.values(db.BaoNhat || {}).some(record => record.HA_id === image?.HA_id)
            || Object.values(db.BaoMat || {}).some(record => record.BM_id !== id && record.HA_id === image?.HA_id);
        if (image && !usedByOtherPost
            && !deleteRecord(dataFolderPath, 'HinhAnh', imageEntry[0], db)) {
            throw createError('Không thể xóa hình ảnh khỏi hệ thống.', 500);
        }
    }

    if (!deleteRecord(dataFolderPath, target.table, id, db)) {
        throw createError('Không thể xóa bài đăng.', 500);
    }
    return { id };
};
