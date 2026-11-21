const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadsMiddleware');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../utils/adminToken');

router.use(requireAdmin);
router.get('/posts', adminController.listPosts);
router.patch('/posts/:id/status', adminController.updatePostStatus);
router.delete('/posts/:id', adminController.deletePost);
router.post('/posts/found', upload.array('images', 5), adminController.createPctsvPost);
router.get('/accounts', adminController.listAccounts);
router.post('/accounts', adminController.createAccount);
router.get('/metadata', adminController.getMetadata);

module.exports = router;
