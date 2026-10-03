// src/server.js
const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'https://giadothatlac.vn',      // Trang web chính thức trên production
    'http://localhost:5500',       // Dùng để test dưới máy local khi dev
    'http://127.0.0.1:5500'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Nếu không có origin (ví dụ gọi từ Postman, cURL, hoặc server-to-server) thì cho qua
        // Hoặc nếu origin nằm trong danh sách trắng thì cho phép
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Còn lại: Chặn cổ, văng lỗi CORS ngay lập tức!
            callback(new Error('Cấm cửa! Trang web này không nằm trong danh sách cho phép.'));
        }
    }
};

// Middleware global đọc JSON
// app.use(cors()) //*
app.use(cors(corsOptions));
app.use(express.json());

// Import user routes
const userRoutes = require('./src/routes/router');

// Gắn tiền tố /api cho gọn
app.use('/api/users', userRoutes);

const server = app.listen(PORT, () => {

    console.log("initialization")
    console.log(`Server đang lượn lờ tại: http://localhost:${PORT}`);
});



const handleShutdown = async (signal) => {
    console.log(`\n[Server]: Nhận được tín hiệu ${signal}. Đang tiến hành đóng hệ thống an toàn...`)
    server.close(async () => {
        console.log("shutting down server");    

    })
}

// Bắt sự kiện khi người dùng bấm Ctrl + C ở terminal
process.on('SIGINT', () => handleShutdown('SIGINT'));

//curl -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d "{\"username\": \"chitrong\", \"password\": \"123\"}"
//curl -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN_HERE" -d "{\"username\": \"chitrong\", \"password\": \"123\"}"
const HTTP_Request = {
    "header": {
        "host": "localhost:3000",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "accept": "application/json",
        "content-type": "application/json",
        "content-length": "284",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "body": {
        "title": "Bỏ quên balo laptop Dell màu đen",
        "category": "electronics",
        "location": {
            "building": "Nhà C2",
            "room": "Phòng máy 302"
        },
        "contact": {
            "name": "Trần Chí Trọng",
            "phone": "0912345678"
        },
        "tags": ["laptop", "dell", "balo đen"]
    }
}


const success = {
    "success": true,
    "status": 200,
    "message": "Lấy danh sách đồ thất lạc thành công!",
    "data": [
        {
            "id": "item_01",
            "title": "Bỏ quên chìa khóa xe Vision",
            "location": "Khu tự học C2",
            "status": "lost"
        }
    ]
}

const failure = {
    "success": false,
    "status": 404,
    "error": {
        "code": "ITEM_NOT_FOUND",
        "message": "Không tìm thấy món đồ thất lạc này trong hệ thống!"
    }
}


const Response = {
    "header": {
        "X-Powered-By": "Express",
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": "185",
        "ETag": "W/'b9-abc123xyz'",
        "Date": "Sat, 03 Oct 2026 17:20:00 GMT",
        "Connection": "keep-alive"
    },
    "body": {
        "success": true,
        "status": 201,
        "message": "Đăng ký thành công qua tầng Service!",
        "data": {
            "id": 482,
            "username": "chitrong",
            "createdAt": "2026-10-03T17:20:00.000Z"
        }
    }
}