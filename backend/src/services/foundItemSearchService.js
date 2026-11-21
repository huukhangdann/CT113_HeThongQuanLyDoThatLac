const CATEGORY_GROUPS = {
    'the-sv': ['THE', 'CCCD', 'GPLX', 'ATM', 'BHXH', 'VE'],
    vi: ['VI', 'LD_01'],
    'dien-tu': ['DT', 'LT', 'MTB', 'TN', 'SAC', 'CAP', 'USB', 'CHUOT', 'BANPHIM', 'LOA', 'DHDT', 'MAYANH'],
    'chia-khoa': ['CHIA'],
    'sach-vo': ['SACH', 'VO', 'BUT', 'THUOC', 'MAYTINH', 'FILE', 'BALO', 'TUI']
};
const LEGACY_CATEGORY_LABELS = { LD_01: 'Ví tiền' };
const CATEGORY_FILTERS = [...Object.keys(CATEGORY_GROUPS), 'khac'];
const MAX_PAGE_SIZE = 50;

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');

const normalizeId = value => String(value || '').trim().toUpperCase();
const normalizeBuildingId = value => normalizeId(value).replace(/^TOA[_-]?/, '');
const normalizeRoomId = value => normalizeId(value).replace(/^PHONG_/, '').split('_').pop();

const queryString = (query, key, fallback = '') => {
    const value = query[key];
    if (value === undefined) return fallback;
    if (typeof value !== 'string') throw createError(`Tham số ${key} không hợp lệ.`);
    return value.trim();
};

const findRecord = (records, id, idField) => {
    if (!id) return null;
    const table = records || {};
    return table[id] || Object.values(table).find(
        record => normalizeId(record[idField]) === normalizeId(id)
    ) || null;
};

const getLocation = (db, locationId) => {
    const location = findRecord(db.DiaDiem, locationId, 'DD_id');
    if (!location) return { location: '', buildingId: '', floorId: '', roomId: '' };

    const building = findRecord(db.Toa, location.Toa_ID, 'Toa_ID')
        || findRecord(db.Toa, normalizeBuildingId(location.Toa_ID), 'Toa_ID');
    const floor = findRecord(db.Tang, location.Tang_id, 'Tang_id');
    const room = findRecord(db.Phong, location.Phong_id, 'Phong_id');
    const locationText = [
        building?.Toa_Ten || normalizeBuildingId(location.Toa_ID),
        floor ? (Number(floor.Tang) === 0 ? 'Tầng trệt' : `Tầng ${floor.Tang}`) : '',
        room?.Phong || ''
    ].filter(Boolean).join(' - ');

    return {
        location: String(location.DD_MoTa || locationText).trim(),
        buildingId: normalizeBuildingId(location.Toa_ID),
        floorId: normalizeId(location.Tang_id),
        floorNumber: floor ? Number(floor.Tang) : null,
        floorName: floor ? (Number(floor.Tang) === 0 ? 'Tầng trệt' : `Tầng ${floor.Tang}`) : '',
        roomId: normalizeId(location.Phong_id),
        roomName: String(room?.Phong || '')
    };
};

const buildFoundItem = (db, record) => {
    const location = getLocation(db, record.DD_id);
    const category = findRecord(db.LoaiDo, record.LD_id, 'LD_id');
    const status = findRecord(db.TrangThaiBaoNhat, record.TT_id, 'TT_id');
    const relatedImages = Object.values(db.HinhAnh || {})
        .filter(imageRecord => imageRecord.BN_id === record.BN_id || imageRecord.HA_id === record.HA_id)
        .map(imageRecord => String(imageRecord.HA_URL || ''))
        .filter(Boolean);
    const imageUrls = [...new Set(relatedImages)];
    const poster = findRecord(db.NguoiDung, record.ND_id, 'ND_id');
    const colorValues = [
        record.BN_MauChuDao,
        record.BN_MauPhu1,
        record.BN_MauPhu2,
        record.BN_MauPhu3
    ].map(value => String(value || '').trim().toUpperCase()).filter(Boolean);

    return {
        id: String(record.BN_id || ''),
        title: String(record.BN_TieuDe || ''),
        description: String(record.BN_MoTa || ''),
        foundAt: Number(record.BN_ThoiGianNhat) || 0,
        postedAt: Number(record.BN_ThoiGianDang) || 0,
        location: location.location,
        buildingId: location.buildingId,
        floorId: location.floorId,
        floorNumber: location.floorNumber,
        floorName: location.floorName,
        roomId: location.roomId,
        roomName: location.roomName,
        categoryId: String(record.LD_id || ''),
        category: String(category?.LD_Ten || LEGACY_CATEGORY_LABELS[normalizeId(record.LD_id)] || 'Chưa phân loại'),
        colors: colorValues,
        status: String(status?.TT_Ten || 'Chưa cập nhật'),
        statusId: String(record.TT_id || ''),
        storage: String(record.BN_NoiLuuGiu || ''),
        question: String(record.BN_CauHoiXacMinh || ''),
        posterName: String(record.BN_TenNguoiLienHe || poster?.ND_HoTen || ''),
        imageUrl: imageUrls[0] || '',
        imageUrls,
    };
};

exports.getFoundItemCategories = db => Object.values(db?.LoaiDo || {})
    .map(category => ({
        id: String(category.LD_id || ''),
        name: String(category.LD_Ten || '')
    }))
    .filter(category => category.id && category.name)
    .sort((left, right) => left.name.localeCompare(right.name, 'vi'));

const parseCustomDate = (value, key) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw createError(`Ngày ${key} không hợp lệ.`);
    }
    const timestamp = Date.parse(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
        throw createError(`Ngày ${key} không hợp lệ.`);
    }
    return timestamp;
};

const getDateRange = (query, now) => {
    const time = queryString(query, 'time', 'all');
    if (time === 'all') return null;
    if (time === 'today') return { from: now - 24 * 60 * 60 * 1000, to: Infinity };
    if (time === 'week') return { from: now - 7 * 24 * 60 * 60 * 1000, to: Infinity };
    if (time === 'month') {
        const startOfMonth = new Date(now);
        startOfMonth.setHours(0, 0, 0, 0);
        startOfMonth.setDate(1);
        return { from: startOfMonth.getTime(), to: Infinity };
    }
    if (time !== 'custom') throw createError('Bộ lọc thời gian không hợp lệ.');

    const from = queryString(query, 'from');
    const to = queryString(query, 'to');
    if (!from || !to) throw createError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
    const start = parseCustomDate(from, 'bắt đầu');
    const end = parseCustomDate(to, 'kết thúc') + 24 * 60 * 60 * 1000;
    if (end <= start) throw createError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
    return { from: start, to: end };
};

const getSelectedColors = query => {
    const rawColors = query.color === undefined ? [] : [].concat(query.color);
    if (rawColors.some(value => typeof value !== 'string')) {
        throw createError('Bộ lọc màu sắc không hợp lệ.');
    }
    const colors = rawColors
        .map(color => color.trim().toUpperCase())
        .filter(color => color && color !== 'ALL');
    if (colors.some(color => !/^#[0-9A-F]{6}$/.test(color))) {
        throw createError('Màu sắc phải có định dạng HEX #RRGGBB.');
    }
    return [...new Set(colors)];
};

const matchesCategory = (categoryId, selectedCategory, db) => {
    if (selectedCategory === 'all') return true;
    if (!CATEGORY_FILTERS.includes(selectedCategory)) {
        throw createError('Loại đồ vật không hợp lệ.');
    }
    if (selectedCategory !== 'khac') {
        return CATEGORY_GROUPS[selectedCategory].includes(normalizeId(categoryId));
    }
    const knownCategories = new Set(Object.values(CATEGORY_GROUPS).flat());
    return !knownCategories.has(normalizeId(categoryId))
        && Boolean(findRecord(db.LoaiDo, categoryId, 'LD_id'));
};

const validateDatabase = db => {
    if (!db || !db.BaoNhat) {
        throw createError('Database chưa sẵn sàng hoặc thiếu bảng BaoNhat.', 500);
    }
};

const filterRecords = (db, query, now = Date.now()) => {
    validateDatabase(db);
    const keyword = queryString(query, 'keyword');
    if (keyword.length > 120) throw createError('Từ khóa không được dài quá 120 ký tự.');
    const normalizedKeyword = normalizeText(keyword);
    const selectedCategory = queryString(query, 'category', 'all').toLowerCase();
    if (selectedCategory !== 'all' && !CATEGORY_FILTERS.includes(selectedCategory)) {
        throw createError('Loại đồ vật không hợp lệ.');
    }
    const colors = getSelectedColors(query);
    const dateRange = getDateRange(query, now);
    const buildingId = normalizeBuildingId(queryString(query, 'building'));
    const floorId = normalizeId(queryString(query, 'floor'));
    const roomId = normalizeId(queryString(query, 'room'));

    const items = Object.values(db.BaoNhat).map(record => buildFoundItem(db, record));
    return items.filter(item => {
        if (!matchesCategory(item.categoryId, selectedCategory, db)) return false;
        if (dateRange && (item.foundAt < dateRange.from || item.foundAt >= dateRange.to)) return false;
        if (buildingId && item.buildingId !== buildingId) return false;
        if (floorId && item.floorId !== floorId) return false;
        if (roomId && normalizeRoomId(item.roomId) !== normalizeRoomId(roomId)) return false;
        if (colors.length && !colors.every(color => item.colors.includes(color))) return false;

        if (normalizedKeyword) {
            const searchableText = normalizeText([
                item.title,
                item.description,
                item.location,
                item.category
            ].join(' '));
            const terms = normalizedKeyword.split(/\s+/).filter(Boolean);
            if (!terms.every(term => searchableText.includes(term))) return false;
        }

        return true;
    });
};

exports.searchFoundItems = (db, query = {}, now = Date.now()) => {
    const results = filterRecords(db, query, now);
    const sort = queryString(query, 'sort', 'newest');
    if (!['newest', 'oldest'].includes(sort)) {
        throw createError('Cách sắp xếp không hợp lệ.');
    }

    results.sort((left, right) => {
        const dateDifference = left.postedAt - right.postedAt;
        return (sort === 'newest' ? -dateDifference : dateDifference)
            || left.id.localeCompare(right.id);
    });

    const pageValue = queryString(query, 'page', '1');
    const pageSizeValue = queryString(query, 'pageSize', '8');
    const page = Number(pageValue);
    const pageSize = Number(pageSizeValue);
    if (!Number.isSafeInteger(page) || page < 1) throw createError('Số trang không hợp lệ.');
    if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
        throw createError(`Số kết quả mỗi trang phải từ 1 đến ${MAX_PAGE_SIZE}.`);
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    return {
        items: results.slice(start, start + pageSize),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};

exports.getFoundItemById = (db, itemId) => {
    validateDatabase(db);
    const record = Object.values(db.BaoNhat).find(
        item => String(item.BN_id || '') === String(itemId)
    );
    return record ? buildFoundItem(db, record) : null;
};
