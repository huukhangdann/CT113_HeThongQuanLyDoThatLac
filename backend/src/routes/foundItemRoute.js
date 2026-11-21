const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadsMiddleware'); // Middleware ghi file vào public/uploads
const foundItemController = require('../controllers/foundItemController');
const foundItemSearchController = require('../controllers/foundItemSearchController');
const verificationRequestController = require('../controllers/verificationRequestController');

// Endpoint: POST /api/found/create
// Luồng: Request (FormData chứa text + files) ➔ Multer (lưu file) ➔ Controller ➔ Service
router.get('/search', foundItemSearchController.searchFoundItems);
router.get('/categories', foundItemSearchController.getFoundItemCategories);
router.get('/:id', foundItemSearchController.getFoundItemById);

router.post(
    '/claim',
    upload.single('proofImage'),
    verificationRequestController.createVerificationRequestController
);

router.post(
    '/create', 
    upload.array('images', 4), 
    foundItemController.postFoundItemController
);

module.exports = router;