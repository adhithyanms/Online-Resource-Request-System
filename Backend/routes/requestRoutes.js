const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, requestController.getAllRequests);
router.get('/my-requests', verifyToken, requestController.getMyRequests);
router.post('/', verifyToken, requestController.createRequest);
router.put('/:id/status', verifyToken, requestController.updateStatus);

module.exports = router;
