const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadsMiddleware');
const verificationRequestController = require('../controllers/verificationRequestController');

// 1. Gửi yêu cầu xác minh quyền sở hữu (hỗ trợ upload 1 file ảnh minh chứng)
router.post(
    '/create',
    upload.single('proofImage'),
    verificationRequestController.createVerificationRequestController
);

// Tương thích thêm endpoint alias
router.post(
    '/claim',
    upload.single('proofImage'),
    verificationRequestController.createVerificationRequestController
);

// 2. Lấy danh sách yêu cầu xác minh theo mã bài đăng báo nhặt
router.get(
    '/item/:bnId',
    verificationRequestController.getRequestsByFoundItemController
);

// 3. Lấy tổng hợp yêu cầu và danh sách bài theo 4 phân đoạn (Người nhặt xem thông báo)
router.get(
    '/overview',
    verificationRequestController.getOwnerRequestsOverviewController
);

// 3.1 Lấy danh sách kết quả ghép nối cho các bài báo mất (>= 0.90 điểm)
router.get(
    '/matches',
    verificationRequestController.getLostItemMatchesController
);

// 4. Chấp nhận 1 yêu cầu xác minh -> Chuyển bài đăng sang "Đang xác minh" (TT_03)
router.post(
    '/accept',
    verificationRequestController.acceptVerificationRequestController
);

// 5. Xác nhận hoàn tất trao trả ngoài đời thực -> Chuyển sang "Đã trao trả" (TT_04)
router.post(
    '/confirm-handover',
    verificationRequestController.confirmHandoverController
);

// 6. Hủy trao trả -> Khôi phục về "Sinh viên đang giữ" / "PCTSV đang giữ"
router.post(
    '/cancel-handover',
    verificationRequestController.cancelHandoverController
);

module.exports = router;
