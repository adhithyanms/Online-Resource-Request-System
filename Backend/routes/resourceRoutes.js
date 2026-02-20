const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken } = require('../middleware/auth');

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', verifyToken, resourceController.createResource);
router.put('/:id', verifyToken, resourceController.updateResource);
router.delete('/:id', verifyToken, resourceController.deleteResource);

module.exports = router;
