// src/controllers/userController.js
const { registerUserService } = require('../services/insertEngine');

const registerUser = async (req, res) => {
    try {
        // Gọi service xử lý logic và nhận kết quả trả về
        const result = await registerUserService(req.body);

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công qua tầng Service!",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { registerUser };