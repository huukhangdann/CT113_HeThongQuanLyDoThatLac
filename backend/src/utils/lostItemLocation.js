const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeBuildingId = value => normalizeText(value)
    .replace(/^toa\s*/, '')
    .replace(/\s+/g, '');

const getLostLocationText = lossItem => {
    const storedLocation = String(lossItem.BM_DiaDiem || '').trim();
    if (storedLocation) return storedLocation;

    const description = String(lossItem.BM_MoTa || '');
    const match = description.match(
        /(?:^| - )Địa điểm nghi mất:\s*(.*?)(?= - (?:Mô tả|Số điện thoại liên hệ|Tên liên hệ|Email liên hệ):|$)/i
    );
    return match ? match[1].trim() : '';
};

const includesPhrase = (text, phrase) => {
    const normalizedText = ` ${normalizeText(text)} `;
    const normalizedPhrase = normalizeText(phrase);
    return Boolean(normalizedPhrase && normalizedText.includes(` ${normalizedPhrase} `));
};

const findTextLocation = (db, locationText) => {
    const buildings = Object.values(db.Toa || {});
    const building = buildings.find(record => {
        const code = String(record.Toa_ID || '').replace(/^TOA[_-]?/i, '');
        return includesPhrase(locationText, code);
    }) || buildings.find(record => includesPhrase(locationText, record.Toa_Ten));
    if (!building) return null;

    const buildingId = normalizeBuildingId(building.Toa_ID);
    const floors = Object.values(db.Tang || {}).filter(
        record => normalizeBuildingId(record.Toa_ID) === buildingId
    );
    const normalizedLocation = normalizeText(locationText);
    const floorMatch = normalizedLocation.match(/\btang\s*(tret|\d+)\b/);
    let floor = floorMatch
        ? floors.find(record => Number(record.Tang) === (floorMatch[1] === 'tret' ? 0 : Number(floorMatch[1])))
        : null;

    const rooms = Object.values(db.Phong || {}).filter(record =>
        !record.Tang_id || floors.some(item => item.Tang_id === record.Tang_id)
    );
    const room = rooms.find(record => {
        const roomNameMatches = includesPhrase(locationText, record.Phong);
        const roomId = String(record.Phong_id || '').replace(/^PHONG[_-]?/i, '').replace(/_/g, ' ');
        return roomNameMatches || includesPhrase(locationText, roomId);
    });
    if (!floor && room) floor = floors.find(record => record.Tang_id === room.Tang_id) || null;

    return {
        Toa_ID: building.Toa_ID,
        Tang_id: floor?.Tang_id || '',
        Tang: floor?.Tang,
        Phong_id: room?.Phong_id || '',
        DD_MoTa: locationText
    };
};

const getLostLocation = (db, lossItem) => {
    const locationText = getLostLocationText(lossItem);
    if (locationText) {
        const resolvedLocation = findTextLocation(db, locationText);
        if (resolvedLocation) return resolvedLocation;
    }

    const locationIds = [lossItem.DD_id];
    if (lossItem.DO_id && lossItem.DO_id !== 'DD_001') locationIds.push(lossItem.DO_id);
    for (const id of locationIds) {
        if (id && db.DiaDiem && db.DiaDiem[id]) return db.DiaDiem[id];
    }

    return {};
};

module.exports = { getLostLocation, getLostLocationText };
