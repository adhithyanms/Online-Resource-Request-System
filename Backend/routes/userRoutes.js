const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getAllUsers);
router.put('/role-by-email', auth, userController.updateRoleByEmail);
router.put('/:id/role', auth, userController.updateUserRole);

module.exports = router;
