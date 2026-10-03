// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Import middleware và controller vừa viết
const { validateRegister } = require('../middleware/middleware');
const { registerUser } = require('../controllers/insertController');

// Định nghĩa endpoint: POST /api/users/register
// Luồng đi: Client gửi request -> Gặp Middleware (validateRegister) -> Chạy vào Controller (registerUser)
router.post('/register', validateRegister, registerUser);

module.exports = router;