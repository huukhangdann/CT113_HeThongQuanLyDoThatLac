const test = require('node:test');
const assert = require('node:assert/strict');
const adminService = require('./adminService');
const authService = require('./authService');
const { createAdminToken, requireAdmin } = require('../utils/adminToken');

const database = {
    BaoNhat: {
        BN_1: {
            BN_id: 'BN_1',
            BN_TieuDe: 'Ví da thật',
            BN_MoTa: 'Ví màu nâu',
            BN_ThoiGianNhat: 1000,
            BN_ThoiGianDang: 2000,
            BN_CauHoiXacMinh: 'Nhãn ví?',
            BN_NoiLuuGiu: 'Bàn trực',
            HA_id: 'HA_1',
            ND_id: 'SV_1',
            DD_id: 'DD_1',
            LD_id: 'VI',
            TT_id: 'TT_01'
        },
        BN_2: {
            BN_id: 'BN_2',
            ND_id: 'SV_1',
            TT_id: 'TT_04'
        }
    },
    BaoMat: {
        BM_1: {
            BM_id: 'BM_1',
            BM_ThoiGianMat: 900,
            BM_ThoiGianDang: 1500,
            BM_MoTa: 'Tên đồ vật: Ví mất - Địa điểm nghi mất: Nhà C1 - Mô tả: Ví màu đen',
            BM_DiaDiem: 'Nhà C1',
            BM_TimThay: false,
            ND_id: 'SV_1',
            LD_id: 'VI',
            HA_id: 'HA_2'
        }
    },
    DiaDiem: {
        DD_1: { DD_id: 'DD_1', Toa_ID: 'C1', Tang_id: 'TANG_C1_2', Phong_id: 'PHONG_201' }
    },
    Toa: { C1: { Toa_ID: 'C1', Toa_Ten: 'Nhà C1' } },
    Tang: { TANG_C1_2: { Tang_id: 'TANG_C1_2', Tang: 2, Toa_ID: 'C1' } },
    Phong: { PHONG_201: { Phong_id: 'PHONG_201', Phong: 'Phòng C1-201' } },
    LoaiDo: { VI: { LD_id: 'VI', LD_Ten: 'Ví tiền' } },
    TrangThaiBaoNhat: { TT_01: { TT_id: 'TT_01', TT_Ten: 'Sinh viên đang giữ' } },
    HinhAnh: {
        HA_1: { HA_id: 'HA_1', HA_URL: '/uploads/found.jpg', BN_id: 'BN_1' },
        HA_2: { HA_id: 'HA_2', HA_URL: '/uploads/lost.jpg' }
    },
    NguoiDung: {
        SV_1: {
            ND_id: 'SV_1',
            ND_HoTen: 'Sinh viên thử nghiệm',
            ND_email: 'student@ctu.edu.vn',
            ND_MatKhau: 'studentpass',
            ND_DiemCong: 7,
            VT_id: 'VT01'
        },
        admin991: {
            ND_id: 'admin991',
            ND_HoTen: 'Quản trị viên',
            ND_email: 'admin@ctu.local',
            ND_MatKhau: 'abcd',
            VT_id: 'VT02'
        }
    },
    TuongThich: {}
};

test('lists real found and lost records with status, poster, and image data', () => {
    const posts = adminService.listPosts(database);

    assert.deepEqual(posts.map(post => post.id), ['BN_1', 'BM_1', 'BN_2']);
    assert.equal(posts[0].title, 'Ví da thật');
    assert.equal(posts[0].status, 'student_holding');
    assert.equal(posts[0].photo, '/uploads/found.jpg');
    assert.equal(posts[1].title, 'Ví mất');
    assert.equal(posts[1].location, 'Nhà C1');
    assert.equal(posts[1].photo, '/uploads/lost.jpg');
});

test('lists account points and does not expose passwords', () => {
    const accounts = adminService.listAccounts(database);
    const student = accounts.find(account => account.code === 'SV_1');
    const admin = accounts.find(account => account.code === 'admin991');

    assert.equal(student.points, 7);
    assert.equal(student.returnedCount, 1);
    assert.equal(admin.role, 'admin');
    assert.equal(admin.points, null);
    assert.equal(Object.prototype.hasOwnProperty.call(student, 'ND_MatKhau'), false);
});

test('authenticates admin role from the stored user record and signs only admin sessions', () => {
    const user = authService.authenticateUser(database, 'admin991', 'abcd');
    assert.equal(user.role, 'admin');
    assert.equal(Object.prototype.hasOwnProperty.call(user, 'ND_MatKhau'), false);
    assert.throws(() => authService.authenticateUser(database, 'admin991', 'wrong'));
});

test('requires a valid signed admin token and rechecks the user role', () => {
    const token = createAdminToken('admin991');
    const req = {
        get: () => `Bearer ${token}`,
        app: { locals: { database } }
    };
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    let authorized = false;
    requireAdmin(req, res, () => { authorized = true; });
    assert.equal(authorized, true);
    assert.equal(req.adminUser.ND_id, 'admin991');

    const deniedResponse = { ...res, status(code) { this.statusCode = code; return this; } };
    requireAdmin({ get: () => '', app: req.app }, deniedResponse, () => {});
    assert.equal(deniedResponse.statusCode, 401);
});
