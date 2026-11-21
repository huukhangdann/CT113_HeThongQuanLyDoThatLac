const express = require('express');
const router = express.Router();
const aiUpload = require('../middlewares/aiUploadMiddleware'); // Middleware xài memoryStorage
const aiController = require('../controllers/aiAnalysisController');

// Endpoint: POST /api/ai/analyze-draft
router.post('/analyze-draft', aiUpload.array('images', 4), aiController.analyzeImagesDraftController);

module.exports = router;