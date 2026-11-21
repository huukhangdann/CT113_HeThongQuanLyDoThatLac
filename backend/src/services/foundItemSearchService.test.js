const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('./foundItemSearchService');

const now = Date.UTC(2026, 10, 17, 12);
const db = {
    BaoNhat: {
        BN_1: {
            BN_id: 'BN_1',
            BN_TieuDe: 'Ví da màu nâu',
            BN_MoTa: 'Ví có khóa kim loại',
            BN_ThoiGianNhat: now - 60_000,
            BN_ThoiGianDang: now - 30_000,
            BN_MauChuDao: '#8B4513',
            BN_MauPhu1: '#222222',
            BN_NoiLuuGiu: 'Bàn trực thư viện',
            BN_CauHoiXacMinh: 'Ví có giấy tờ gì?',
            ND_id: 'SV_1',
            DD_id: 'DD_1',
            LD_id: 'VI',
            HA_id: 'HA_1',
            TT_id: 'TT_1'
        },
        BN_2: {
            BN_id: 'BN_2',
            BN_TieuDe: 'Thẻ sinh viên màu xanh',
            BN_MoTa: 'Tìm chủ thẻ',
            BN_ThoiGianNhat: now - 8 * 24 * 60 * 60 * 1000,
            BN_ThoiGianDang: now - 20_000,
            BN_MauChuDao: '#0000FF',
            ND_id: 'SV_1',
            DD_id: 'DD_2',
            LD_id: 'THE',
            HA_id: 'HA_2',
            TT_id: 'TT_1'
        }
    },
    DiaDiem: {
        DD_1: { DD_id: 'DD_1', Toa_ID: 'TOA_C1', Tang_id: 'TANG_C1_2', Phong_id: 'PHONG_201' },
        DD_2: { DD_id: 'DD_2', Toa_ID: 'D2', Tang_id: 'TANG_D2_1', Phong_id: 'PHONG_D2_101' }
    },
    Toa: {
        C1: { Toa_ID: 'C1', Toa_Ten: 'Dãy nhà học C1' },
        D2: { Toa_ID: 'D2', Toa_Ten: 'Nhà Điều hành' }
    },
    Tang: {
        TANG_C1_2: { Tang_id: 'TANG_C1_2', Tang: 2, Toa_ID: 'C1' },
        TANG_D2_1: { Tang_id: 'TANG_D2_1', Tang: 1, Toa_ID: 'D2' }
    },
    Phong: {
        PHONG_201: { Phong_id: 'PHONG_201', Phong: 'Phòng C1-201' },
        PHONG_D2_101: { Phong_id: 'PHONG_D2_101', Phong: 'Phòng D2-101' }
    },
    LoaiDo: {
        VI: { LD_id: 'VI', LD_Ten: 'Ví tiền' },
        THE: { LD_id: 'THE', LD_Ten: 'Thẻ sinh viên' }
    },
    TrangThaiBaoNhat: {
        TT_1: { TT_id: 'TT_1', TT_Ten: 'Đang giữ đồ' }
    },
    HinhAnh: {
        HA_1: { HA_id: 'HA_1', HA_URL: '/uploads/wallet.jpg' },
        HA_2: { HA_id: 'HA_2', HA_URL: '/uploads/card.jpg' }
    },
    NguoiDung: {
        SV_1: { ND_id: 'SV_1', ND_HoTen: 'Sinh viên thử nghiệm' }
    }
};

test('joins related records and searches Vietnamese text without accents', () => {
    const result = service.searchFoundItems(db, {
        keyword: 'vi nau',
        category: 'vi'
    }, now);

    assert.equal(result.total, 1);
    assert.equal(result.items[0].id, 'BN_1');
    assert.equal(result.items[0].location, 'Dãy nhà học C1 - Tầng 2 - Phòng C1-201');
    assert.equal(result.items[0].buildingId, 'C1');
    assert.equal(result.items[0].floorNumber, 2);
    assert.equal(result.items[0].floorName, 'Tầng 2');
    assert.equal(result.items[0].roomName, 'Phòng C1-201');
    assert.equal(result.items[0].category, 'Ví tiền');
    assert.equal(result.items[0].status, 'Đang giữ đồ');
    assert.equal(result.items[0].statusId, 'TT_1');
    assert.equal(result.items[0].imageUrl, '/uploads/wallet.jpg');
});

test('filters by location, every selected color, and found time', () => {
    const result = service.searchFoundItems(db, {
        building: 'C1',
        floor: 'TANG_C1_2',
        room: 'PHONG_C1_201',
        color: ['#8b4513', '#222222'],
        time: 'today'
    }, now);

    assert.deepEqual(result.items.map(item => item.id), ['BN_1']);
});

test('supports sorting and paginates results', () => {
    const result = service.searchFoundItems(db, {
        sort: 'oldest',
        page: '1',
        pageSize: '1'
    }, now);

    assert.equal(result.total, 2);
    assert.equal(result.totalPages, 2);
    assert.equal(result.items[0].id, 'BN_1');
});

test('rejects invalid filters and returns a detail record by id', () => {
    assert.throws(() => service.searchFoundItems(db, { category: 'unknown' }, now), {
        message: 'Loại đồ vật không hợp lệ.'
    });
    assert.equal(service.getFoundItemById(db, 'BN_2').title, 'Thẻ sinh viên màu xanh');
    assert.equal(service.getFoundItemById(db, 'missing'), null);
});
