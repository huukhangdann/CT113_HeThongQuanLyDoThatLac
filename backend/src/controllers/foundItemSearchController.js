const foundItemSearchService = require('../services/foundItemSearchService');

const getDatabase = req => {
    const db = req.app.locals.database;
    if (!db) {
        const error = new Error('Database chưa được khởi tạo.');
        error.statusCode = 500;
        throw error;
    }
    return db;
};

const sendError = (res, error) => {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    if (statusCode >= 500) console.error('[Found Item Search Error]:', error);
    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? 'Lỗi xử lý truy vấn bài đăng nhặt đồ.' : error.message
    });
};

exports.searchFoundItems = (req, res) => {
    try {
        const result = foundItemSearchService.searchFoundItems(getDatabase(req), req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getFoundItemCategories = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: foundItemSearchService.getFoundItemCategories(getDatabase(req))
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getFoundItemById = (req, res) => {
    try {
        const item = foundItemSearchService.getFoundItemById(getDatabase(req), req.params.id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài đăng nhặt đồ.'
            });
        }
        return res.status(200).json({ success: true, item });
    } catch (error) {
        return sendError(res, error);
    }
};
