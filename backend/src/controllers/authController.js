const authService = require('../services/authService');
const { createAdminToken } = require('../utils/adminToken');

exports.loginUser = (req, res) => {
    try {
        const { email, password } = req.body;

        // Lấy biến db tổng từ app.locals trên RAM
        const db = req.app.locals.database;

        // Gọi sang Service để xử lý logic nghiệp vụ
        const userInfo = authService.authenticateUser(db, email, password);
        const token = userInfo.role === 'admin' ? createAdminToken(userInfo.ND_id) : undefined;

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            user: userInfo,
            ...(token ? { token } : {})
        });

    } catch (error) {
        // Bắt các lỗi do Service ném ra (sai mật khẩu, không thấy email,...)
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};