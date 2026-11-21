const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const service = require('./verificationRequestService');

test('verificationRequestService - full workflow tests', async (t) => {
    const now = Date.now();
    const mockDb = {
        BaoNhat: {
            BN_TEST_1: {
                BN_id: 'BN_TEST_1',
                BN_TieuDe: 'Nhặt được ví da',
                BN_MoTa: 'Ví da nâu ở bàn C1',
                BN_ThoiGianNhat: now - 3600000,
                BN_ThoiGianDang: now - 1800000,
                BN_CauHoiXacMinh: 'Trong ví có thẻ tên gì?',
                ND_id: 'B2404990',
                TT_id: 'TT_01',
                BN_NoiLuuGiu: 'Tự giữ'
            },
            BN_TEST_EXPIRED: {
                BN_id: 'BN_TEST_EXPIRED',
                BN_TieuDe: 'Bình nước Lock&Lock',
                BN_MoTa: 'Quên ở phòng học',
                BN_ThoiGianNhat: now - 40 * 24 * 3600 * 1000,
                BN_ThoiGianDang: now - 35 * 24 * 3600 * 1000,
                BN_ThoiGianXacMinh: now - 31 * 24 * 3600 * 1000, // Đang xác minh quá 31 ngày
                ND_id: 'B2404990',
                TT_id: 'TT_03',
                BN_NoiLuuGiu: 'Phòng PCTSV'
            }
        },
        YeucauNhanDo: {},
        NguoiDung: {
            B2405015: {
                ND_id: 'B2405015',
                ND_HoTen: 'Trần Chí Trọng',
                ND_email: 'trongb2483@gmail.com',
                ND_SDT: '0394863566'
            },
            B2404990: {
                ND_id: 'B2404990',
                ND_HoTen: 'Đặng Hữu Khang',
                ND_email: 'huukhangb2483@gmail.com',
                ND_SDT: '0394863566'
            }
        },
        TrangThaiBaoNhat: {
            TT_01: { TT_id: 'TT_01', TT_Ten: 'Sinh viên đang giữ' },
            TT_02: { TT_id: 'TT_02', TT_Ten: 'PCTSV đang giữ' },
            TT_03: { TT_id: 'TT_03', TT_Ten: 'Đang xác minh' },
            TT_04: { TT_id: 'TT_04', TT_Ten: 'Đã trao trả' },
            TT_05: { TT_id: 'TT_05', TT_Ten: 'Đã được ẩn' }
        },
        HinhAnh: {}
    };

    await t.test('1. Tạo yêu cầu xác minh thành công', () => {
        const payload = {
            bnId: 'BN_TEST_1',
            answer: 'Thẻ sinh viên mang tên Trần Chí Trọng',
            message: 'Mình có thể gặp bạn lúc 16h ở sảnh C1 để nhận lại ví',
            phoneNumber: '0912345678',
            ndId: 'B2405015'
        };

        const result = service.createVerificationRequest(mockDb, payload, null);
        assert.ok(result.request);
        assert.equal(result.request.BN_id, 'BN_TEST_1');
        assert.equal(result.request.CauTraLoiXacMinh, payload.answer);
        assert.equal(result.request.ND_id, 'B2405015');
        assert.equal(result.request.DuocChapNhan, false);
        assert.equal(result.request.TrangThai, 'ChoXacNhan');
    });

    await t.test('2. Lấy danh sách yêu cầu xác minh theo bài đăng', () => {
        const result = service.getRequestsByFoundItem(mockDb, 'BN_TEST_1');
        assert.equal(result.requests.length, 1);
        assert.equal(result.requests[0].studentName, 'Trần Chí Trọng');
        assert.equal(result.requests[0].answer, 'Thẻ sinh viên mang tên Trần Chí Trọng');
    });

    await t.test('3. Chấp nhận yêu cầu xác minh -> Chuyển sang TT_03 ("Đang xác minh")', () => {
        const reqList = service.getRequestsByFoundItem(mockDb, 'BN_TEST_1');
        const ycId = reqList.requests[0].id;

        const acceptResult = service.acceptVerificationRequest(mockDb, ycId, 'BN_TEST_1');
        assert.equal(acceptResult.foundItem.TT_id, 'TT_03');
        assert.equal(acceptResult.request.DuocChapNhan, true);
        assert.equal(acceptResult.request.TrangThai, 'DaChapNhan');
        assert.equal(mockDb.BaoNhat.BN_TEST_1.TT_id, 'TT_03');
    });

    await t.test('4. Phân đoạn danh sách bài đăng: bài BN_TEST_1 phải nằm ở inProgressItems ("Những món đồ đang xử lý")', () => {
        const overview = service.getOwnerRequestsOverview(mockDb, 'B2404990', now);
        const inProgress = overview.inProgressItems.find(item => item.id === 'BN_TEST_1');
        assert.ok(inProgress, 'Bài đăng phải nằm trong danh sách đang xử lý');
        assert.equal(inProgress.statusId, 'TT_03');
        assert.equal(inProgress.statusName, 'Đang xác minh');
    });

    await t.test('5. Tự động kích hoạt trạng thái "Đã được ẩn" (TT_05) khi ở trạng thái "Đang xác minh" quá 30 ngày', () => {
        // Bài BN_TEST_EXPIRED ở trạng thái TT_03 quá 31 ngày
        service.autoExpireVerificationStatus(mockDb, now);
        assert.equal(mockDb.BaoNhat.BN_TEST_EXPIRED.TT_id, 'TT_05');

        const overview = service.getOwnerRequestsOverview(mockDb, 'B2404990', now);
        const expired = overview.expiredItems.find(item => item.id === 'BN_TEST_EXPIRED');
        assert.ok(expired, 'Bài đăng quá hạn phải nằm trong expiredItems');
        assert.equal(expired.statusId, 'TT_05');
        assert.equal(expired.statusName, 'Đã được ẩn');
    });

    await t.test('6. Xác nhận hoàn tất trao trả ngoài đời -> Chuyển sang TT_04 ("Đã trao trả")', () => {
        const confirmResult = service.confirmHandover(mockDb, 'BN_TEST_1');
        assert.equal(confirmResult.foundItem.TT_id, 'TT_04');
        assert.equal(mockDb.BaoNhat.BN_TEST_1.TT_id, 'TT_04');

        const overview = service.getOwnerRequestsOverview(mockDb, 'B2404990', now);
        const completed = overview.completedItems.find(item => item.id === 'BN_TEST_1');
        assert.ok(completed, 'Bài đăng phải nằm trong completedItems');
        assert.equal(completed.statusId, 'TT_04');
        assert.equal(completed.statusName, 'Đã trao trả');
    });

    await t.test('7. Hủy trao trả -> Khôi phục về TT_01 / TT_02', () => {
        mockDb.BaoNhat.BN_TEST_1.TT_id = 'TT_03';
        const cancelResult = service.cancelHandover(mockDb, 'BN_TEST_1', 'Không khớp thông tin');
        assert.equal(cancelResult.foundItem.TT_id, 'TT_01');
    });
});

test('getLostItemMatches only returns the owner’s matches and uses the lost item photo', () => {
    const db = {
        BaoMat: {
            BM_OWNED: {
                BM_id: 'BM_OWNED',
                BM_MoTa: 'Tên đồ vật: Ví da xanh - Mất gần thư viện',
                BM_TimThay: false,
                ND_id: 'OWNER_1',
                HA_id: 'HA_LOST'
            }
        },
        TuongThich: {
            TC_1: { TC_id: 'TC_1', BM_id: 'BM_OWNED', BN_id: 'BN_FOUND', DoTuongThich: 0.9 },
            TC_LOW: { TC_id: 'TC_LOW', BM_id: 'BM_OWNED', BN_id: 'BN_LOW', DoTuongThich: 0.899 }
        },
        BaoNhat: {
            BN_FOUND: {
                BN_id: 'BN_FOUND',
                BN_TieuDe: 'Ví da xanh tìm được',
                LD_id: 'VI',
                TT_id: 'TT_01',
                HA_id: 'HA_FOUND',
                DD_id: 'DD_FOUND'
            },
            BN_LOW: {
                BN_id: 'BN_LOW',
                BN_TieuDe: 'Ví không đủ điểm',
                LD_id: 'VI',
                TT_id: 'TT_01',
                HA_id: 'HA_LOW'
            }
        },
        HinhAnh: {
            HA_LOST: { HA_id: 'HA_LOST', HA_URL: '/uploads/lost.jpg' },
            HA_FOUND: { HA_id: 'HA_FOUND', HA_URL: '/uploads/found.jpg', BN_id: 'BN_FOUND' },
            HA_LOW: { HA_id: 'HA_LOW', HA_URL: '/uploads/low.jpg', BN_id: 'BN_LOW' }
        },
        DiaDiem: {
            DD_FOUND: { DD_id: 'DD_FOUND', Toa_ID: 'C1', Tang_id: 'TANG_C1_2', Phong_id: 'PHONG_C1_201' }
        },
        Toa: { C1: { Toa_ID: 'C1', Toa_Ten: 'Tòa C1' } },
        Tang: { TANG_C1_2: { Tang_id: 'TANG_C1_2', Tang: 2 } },
        Phong: { PHONG_C1_201: { Phong_id: 'PHONG_C1_201', Phong: 'P.201' } },
        LoaiDo: { VI: { LD_id: 'VI', LD_Ten: 'Ví tiền' } },
        TrangThaiBaoNhat: { TT_01: { TT_id: 'TT_01', TT_Ten: 'Đang giữ đồ' } }
    };

    assert.deepEqual(service.getLostItemMatches(db), []);
    assert.deepEqual(service.getLostItemMatches(db, 'OTHER_USER'), []);

    const [match] = service.getLostItemMatches(db, 'OWNER_1');
    assert.equal(match.title, 'Ví da xanh');
    assert.equal(match.imageUrl, '/uploads/lost.jpg');
    assert.equal(match.matchedItems.length, 1);
    assert.equal(match.matchedItems[0].foundItem.imageUrl, '/uploads/found.jpg');
    assert.equal(match.matchedItems[0].foundItem.category, 'Ví tiền');
});
