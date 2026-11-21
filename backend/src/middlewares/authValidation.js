exports.validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Lỗi từ Middleware: Thiếu email hoặc mật khẩu trong request body!"
        });
    }

    // Nếu mọi thứ ổn thỏa, cho phép đi tiếp vào Controller
    next();
};