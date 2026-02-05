const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', auth, resourceController.createResource);
router.put('/:id', auth, resourceController.updateResource);
router.delete('/:id', auth, resourceController.deleteResource);

module.exports = router;
