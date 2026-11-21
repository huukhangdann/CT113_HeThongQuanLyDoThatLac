const lostItemService = require('../services/lostItemService');

/**
 * Controller điều phối đăng tin mất đồ kèm mảng ảnh
 */
exports.postLostItemWithMultipleImages = (req, res) => {
    try {
        const db = req.app.locals.database;

        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống: Database chưa được khởi tạo trên RAM!"
            });
        }

        // `req.files` sẽ là một mảng (array) chứa các file do Multer bắt được
        const resultData = lostItemService.createLostItemWithMultipleImages(db, req.body, req.files);

        return res.status(200).json({
            success: true,
            message: `Đăng tin thành công kèm theo ${resultData.uploadedImagesCount} hình ảnh!`,
            data: resultData.lossItem
        });

    } catch (error) {
        console.error("[Controller Error]:", error.message);
        const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? "Lỗi xử lý server!" : error.message
        });
    }
};