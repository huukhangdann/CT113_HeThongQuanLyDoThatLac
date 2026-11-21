const multer = require('multer');

// Lưu file trực tiếp trên RAM dạng Buffer tạm thời
const storage = multer.memoryStorage();

const aiUpload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB mỗi ảnh
});

module.exports = aiUpload;