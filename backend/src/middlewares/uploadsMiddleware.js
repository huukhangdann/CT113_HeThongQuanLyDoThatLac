// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và tên file ảnh khi upload lên server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Thư mục chứa ảnh (đảm bảo thư mục public/uploads đã được tạo sẵn)
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: (req, file, cb) => {
        // Đặt tên file độc lập bằng timestamp + đuôi mở rộng gốc để tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file tối đa 5MB cho nhẹ server
});

module.exports = upload;