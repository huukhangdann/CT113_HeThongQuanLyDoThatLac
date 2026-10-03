// src/services/userService.js
const registerUserService = async (userData) => {
    const { username, password } = userData;

    // Kiểm tra logic nghiệp vụ ở đây (Ví dụ: user đã tồn tại chưa?)
    console.log(`[Service]: Đang kiểm tra database cho user: ${username}`);
    
    // Giả lập lưu thành công và trả về data mới
    const newUser = {
        id: Math.floor(Math.random() * 1000),
        username: username,
        createdAt: new Date().toISOString()
    };

    return newUser;
};

module.exports = { registerUserService };