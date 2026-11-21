// src/server.js
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'https://giadothatlac.vn',      
    'http://localhost:5173',       
    'http://127.0.0.1:5173',
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


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
//Router
const authRoute = require('./src/routes/userRouter');
app.use('/api/auth', authRoute);

const lostItemRoute = require('./src/routes/lostItemRoute')
app.use('/api/lost', lostItemRoute);

const aiAnalysisRoute = require('./src/routes/aiAnalysisRoute')
app.use('/api/analysis/', aiAnalysisRoute);

const foundItemRoute = require('./src/routes/foundItemRoute');
app.use('/api/found', foundItemRoute);

const verificationRequestRoute = require('./src/routes/verificationRequestRoute');
app.use('/api/verification-requests', verificationRequestRoute);




const loadDatabase = require("./database/engine/read")
const foundItemService = require('./src/services/foundItemService');

const server = app.listen(PORT, () => {

    console.log("initialization")
    
    console.log("-----------------------DATABASE WARM UP---------------------");
    const dbPath = path.join(__dirname, './database/records');
    app.locals.database = loadDatabase(dbPath);
    const backfilledMatches = foundItemService.backfillMissingMatches(app.locals.database);
    if (backfilledMatches > 0) {
        console.log(`[Neural Matcher] Đã khôi phục ${backfilledMatches} kết quả ghép nối còn thiếu.`);
    }

    console.log(app.locals.database.NguoiDung["B2405015"]);
   
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
