const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.get('/', auth, requestController.getAllRequests);
router.get('/my-requests', auth, requestController.getMyRequests);
router.post('/', auth, requestController.createRequest);
router.put('/:id/status', auth, requestController.updateStatus);

module.exports = router;
