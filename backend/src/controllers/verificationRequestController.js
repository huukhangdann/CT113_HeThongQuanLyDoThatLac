const verificationRequestService = require('../services/verificationRequestService');

const getDbOrThrow = req => {
    const db = req.app.locals.database;
    if (!db) {
        const error = new Error('Lỗi hệ thống: Database chưa được khởi tạo trên RAM!');
        error.statusCode = 500;
        throw error;
    }
    return db;
};

const sendError = (res, error, defaultMessage = 'Lỗi xử lý yêu cầu xác minh!') => {
    console.error('[Verification Request Error]:', error);
    const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 500;
    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? defaultMessage : error.message
    });
};

/**
 * Tạo yêu cầu xác minh nhận đồ
 * POST /api/verification-requests/create hoặc POST /api/found/claim
 */
exports.createVerificationRequestController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const result = verificationRequestService.createVerificationRequest(db, req.body, req.file);

        return res.status(201).json({
            success: true,
            message: 'Gửi yêu cầu xác minh thành công! Lời nhắn của bạn đã được chuyển tới người nhặt.',
            data: result.request
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi lưu yêu cầu xác minh nhận đồ!');
    }
};

/**
 * Lấy danh sách yêu cầu xác minh của 1 bài đăng báo nhặt
 * GET /api/verification-requests/item/:bnId
 */
exports.getRequestsByFoundItemController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const bnId = req.params.bnId;
        const result = verificationRequestService.getRequestsByFoundItem(db, bnId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi lấy danh sách yêu cầu xác minh!');
    }
};

/**
 * Lấy tổng hợp các bài đăng và yêu cầu của người dùng theo 4 phân đoạn
 * GET /api/verification-requests/overview?ndId=...
 */
exports.getOwnerRequestsOverviewController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const ndId = req.query.ndId || null;
        const result = verificationRequestService.getOwnerRequestsOverview(db, ndId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi lấy dữ liệu tổng hợp yêu cầu!');
    }
};

/**
 * Chấp nhận yêu cầu xác minh -> chuyển bài đăng sang "Đang xác minh" (TT_03)
 * POST /api/verification-requests/accept
 */
exports.acceptVerificationRequestController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const { ycId, bnId } = req.body;
        if (!ycId || !bnId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin ycId hoặc bnId để chấp nhận yêu cầu.'
            });
        }

        const result = verificationRequestService.acceptVerificationRequest(db, ycId, bnId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi chấp nhận yêu cầu xác minh!');
    }
};

/**
 * Xác nhận hoàn tất trao trả ngoài đời thực -> chuyển bài đăng sang "Đã trao trả" (TT_04)
 * POST /api/verification-requests/confirm-handover
 */
exports.confirmHandoverController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const { bnId } = req.body;
        if (!bnId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã bài đăng bnId để xác nhận hoàn tất trao trả.'
            });
        }

        const result = verificationRequestService.confirmHandover(db, bnId);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi xác nhận hoàn tất trao trả!');
    }
};

/**
 * Lấy danh sách kết quả ghép nối cho các bài báo mất (>= 0.90 điểm)
 * GET /api/verification-requests/matches?ndId=...
 */
exports.getLostItemMatchesController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const ndId = req.query.ndId || null;
        const matches = verificationRequestService.getLostItemMatches(db, ndId);

        return res.status(200).json({
            success: true,
            data: matches
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi lấy kết quả ghép nối!');
    }
};

exports.cancelHandoverController = (req, res) => {
    try {
        const db = getDbOrThrow(req);
        const { bnId, reason } = req.body;
        if (!bnId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mã bài đăng bnId để hủy trao trả.'
            });
        }

        const result = verificationRequestService.cancelHandover(db, bnId, reason);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        return sendError(res, error, 'Lỗi server khi hủy trao trả!');
    }
};
