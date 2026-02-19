const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { uploadProfileDocs } = require('../middleware/uploadMiddleware');

// Admin: add user by email
router.post('/', auth, userController.addAllowedUser);

// Admin: search users by email
router.get('/search', auth, userController.searchUsers);

// Authenticated user: get own profile
router.get('/me', auth, userController.getUserProfile);

// Authenticated user: update own profile
router.put('/me/profile', auth, uploadProfileDocs, userController.updateMyProfile);

// Admin: get all users
router.get('/', auth, userController.getAllUsers);

// Admin: get requests for a specific user
router.get('/:id/requests', auth, userController.getUserRequests);

// Admin: update user profile (text + file uploads)
router.put('/:id/profile', auth, uploadProfileDocs, userController.updateUserProfile);

// Admin: update role by email
router.put('/role-by-email', auth, userController.updateRoleByEmail);

// Admin: update role by ID
router.put('/:id/role', auth, userController.updateUserRole);

// Admin: delete user
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
