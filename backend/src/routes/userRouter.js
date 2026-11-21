const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLoginInput } = require('../middlewares/authValidation');

// Luồng đi: Request ➔ Middleware (Gác cổng check dữ liệu) ➔ Controller (Xử lý logic)
router.post('/login', validateLoginInput, authController.loginUser);

module.exports = router;