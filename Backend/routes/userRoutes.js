const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { uploadProfileDocs } = require('../middleware/uploadMiddleware');

// Admin: add user by email
router.post('/', verifyToken, userController.addAllowedUser);

// Admin: search users by email
router.get('/search', verifyToken, userController.searchUsers);

// Authenticated user: get own profile
router.get('/me', verifyToken, userController.getUserProfile);

// Authenticated user: update own profile
router.put('/me/profile', verifyToken, uploadProfileDocs, userController.updateMyProfile);

// Admin: get all users
router.get('/', verifyToken, userController.getAllUsers);

// Admin: get requests for a specific user
router.get('/:id/requests', verifyToken, userController.getUserRequests);

// Admin: update user profile (text + file uploads)
router.put('/:id/profile', verifyToken, uploadProfileDocs, userController.updateUserProfile);

// Admin: update role by email
router.put('/role-by-email', verifyToken, userController.updateRoleByEmail);

// Admin: update role by ID
router.put('/:id/role', verifyToken, userController.updateUserRole);

// Admin: delete user
router.delete('/:id', verifyToken, userController.deleteUser);


module.exports = router;
