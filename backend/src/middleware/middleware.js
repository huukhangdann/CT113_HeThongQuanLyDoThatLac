// src/middlewares/validateMiddleware.js
const validateRegister = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log(token);
    const { username, password } = req.body;
    
    // Nếu thiếu thông tin thì chặn lại luôn
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Này! Thiếu username hoặc password kìa, tính hack à?' 
        });
    }
    
    console.log('[Middleware Bảo Vệ]: Dữ liệu sạch sẽ, cho qua!');
    next(); // Hợp lệ thì gọi next() để đi tiếp vào Controller
};

module.exports = { validateRegister };