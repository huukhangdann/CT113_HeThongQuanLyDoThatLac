const foundItemService = require('../services/foundItemService');

/**
 * Controller điều phối yêu cầu đăng bài báo nhặt đồ chính thức
 */
exports.postFoundItemController = (req, res) => {
    try {
        const db = req.app.locals.database;

        if (!db) {
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống: Database chưa được khởi tạo trên RAM!"
            });
        }

        // Gọi Service xử lý lưu trữ dữ liệu và file ảnh
        const result = foundItemService.createFoundItemRecord(db, req.body, req.files);

        return res.status(201).json({
            success: true,
            message: `Đăng bài báo nhặt đồ thành công kèm theo ${result.uploadedImagesCount} hình ảnh! 🎉`,
            data: result.foundItem,
            uploadedImagesCount: result.uploadedImagesCount
        });

    } catch (error) {
        console.error("[Found Item Controller Error]:", error);
        const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
            ? error.statusCode
            : 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode >= 500
                ? "Lỗi xử lý server khi lưu bài báo nhặt!"
                : error.message
        });
    }
};