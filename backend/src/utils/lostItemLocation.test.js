const test = require('node:test');
const assert = require('node:assert/strict');
const { getLostLocation } = require('./lostItemLocation');
const { scoreFoundAndLostItems } = require('../services/foundItemService');

test('resolves lost location text instead of the legacy DD_001 placeholder', () => {
    const db = {
        DiaDiem: {
            DD_001: { DD_id: 'DD_001', Toa_ID: 'C1', Tang_id: 'TANG_C1_2', Phong_id: 'PHONG_C1_201' },
            DD_FOUND: { DD_id: 'DD_FOUND', Toa_ID: 'A3', Tang_id: 'TANG_A3_0', Phong_id: 'PHONG_A3_001' }
        },
        Toa: { A3: { Toa_ID: 'A3', Toa_Ten: 'Dãy nhà học A3' } },
        Tang: { TANG_A3_0: { Tang_id: 'TANG_A3_0', Tang: 0, Toa_ID: 'A3' } },
        Phong: { PHONG_A3_001: { Phong_id: 'PHONG_A3_001', Phong: 'Phòng A3-001', Tang_id: 'TANG_A3_0' } }
    };
    const lostItem = {
        DO_id: 'DD_001',
        BM_MoTa: 'Tên đồ vật: Ví da - Địa điểm nghi mất: Dãy nhà học A3 (A3) - Tầng trệt - Phòng A3-001 - Mô tả: Ví da màu nâu'
    };

    assert.deepEqual(getLostLocation(db, lostItem), {
        Toa_ID: 'A3',
        Tang_id: 'TANG_A3_0',
        Tang: 0,
        Phong_id: 'PHONG_A3_001',
        DD_MoTa: 'Dãy nhà học A3 (A3) - Tầng trệt - Phòng A3-001'
    });

    const score = scoreFoundAndLostItems(db, {
        BN_id: 'BN_TEST',
        BN_TieuDe: 'Ví tiền bằng da màu nâu có nút bấm',
        BN_MoTa: 'Ví tiền gấp đôi bằng da màu nâu bóng, có quai cài kim loại.',
        BN_ThoiGianNhat: 1795272120000,
        BN_MauChuDao: '#7A3E1D',
        DD_id: 'DD_FOUND',
        BN_MauPhu1: '#4A220E',
        BN_MauPhu2: '#B0623B'
    }, {
        ...lostItem,
        BM_ThoiGianMat: 1795269480000,
        BM_MauChuDao: '#99480A'
    });

    assert.ok(score >= 0.9, `Expected a qualified score, got ${score}`);
});
