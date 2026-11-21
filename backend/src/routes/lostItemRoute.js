const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadsMiddleware');
const lostItemController = require('../controllers/lostItemController');

// Endpoint: POST /api/lost/create-with-images
// Dùng `upload.array('images', 5)` để bắt mảng file (tối đa 5 tấm ảnh)
router.post(
    '/create-with-images', 
    upload.array('images', 5), 
    lostItemController.postLostItemWithMultipleImages
);

module.exports = router;