const adminService = require('../services/adminService');
const handleError = (res, error) => res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Đã xảy ra lỗi khi xử lý thao tác quản trị.'
});

exports.listPosts = (req, res) => {
    try {
        return res.json({ success: true, data: adminService.listPosts(req.app.locals.database) });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.updatePostStatus = (req, res) => {
    try {
        const body = req.body || {};
        const result = adminService.updatePostStatus(
            req.app.locals.database,
            req.params.id,
            body.status,
            body.reason
        );
        return res.json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.deletePost = (req, res) => {
    try {
        const result = adminService.deletePost(req.app.locals.database, req.params.id);
        return res.json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.listAccounts = (req, res) => {
    try {
        return res.json({ success: true, data: adminService.listAccounts(req.app.locals.database) });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.getMetadata = (req, res) => {
    try {
        return res.json({ success: true, data: adminService.getMetadata(req.app.locals.database) });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.createAccount = (req, res) => {
    try {
        const result = adminService.createAccount(req.app.locals.database, req.body || {});
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.createPctsvPost = (req, res) => {
    try {
        let body;
        try {
            body = JSON.parse(String(req.body?.data || '{}'));
        } catch (error) {
            error.statusCode = 400;
            error.message = 'Dữ liệu bài đăng không đúng định dạng.';
            throw error;
        }
        const result = adminService.createPctsvPost(
            req.app.locals.database,
            req.adminUser,
            body,
            req.files
        );
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return handleError(res, error);
    }
};
