const User = require('../models/User');
const Request = require('../models/Request');
const bcrypt = require('bcryptjs');
const path = require('path');

const SUPER_ADMIN_EMAIL = 'adhithyanshanmugam@gmail.com';

const USER_PUBLIC_FIELDS = 'email fullName role isAllowed phone address profilePhotoUrl aadhaarPhotoUrl panCardPhotoUrl createdAt';

const isAdmin = (req) => req.user?.role === 'admin' || req.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

const isSuperAdmin = (req) => req.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

const accessDenied = (res, message = 'Access denied') => res.status(403).json({ message });

// Multer file objects differ between local disk storage and Cloudinary storage:
// - local: { filename, path }
// - Cloudinary: { filename (public_id), path (URL) }
const getUploadedUrl = (file) => {
    if (!file) return '';

    // CloudinaryStorage sets `path` to a full URL for fetching.
    if (typeof file.path === 'string' && /^https?:\/\//i.test(file.path)) return file.path;

    // Local disk storage: we store the URL as /uploads/<filename>
    if (file.filename) return `/uploads/${file.filename}`;

    // Fallback: derive name from local path.
    if (typeof file.path === 'string') {
        const name = path.basename(file.path);
        return name ? `/uploads/${name}` : '';
    }

    return '';
};

// Helper: Map user to public response object
const mapUserResponse = (user) => ({
    _id: user._id,
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isAllowed: user.isAllowed,
    phone: user.phone,
    address: user.address,
    profilePhotoUrl: user.profilePhotoUrl,
    aadhaarPhotoUrl: user.aadhaarPhotoUrl,
    panCardPhotoUrl: user.panCardPhotoUrl,
    createdAt: user.createdAt
});

// GET /users — get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);
        const users = await User.find({}, USER_PUBLIC_FIELDS).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /users — admin adds a user by email only
exports.addAllowedUser = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);

        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            // If exists but not allowed, allow them now
            if (!existing.isAllowed) {
                existing.isAllowed = true;
                await existing.save();
                return res.status(200).json({ message: 'User activated successfully', user: existing });
            }
            return res.status(409).json({ message: 'User already exists and is activated' });
        }

        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10);

        const user = new User({
            email: normalizedEmail,
            password: randomPassword,
            isAllowed: true,
            role: 'user',
            fullName: ''
        });
        await user.save();

        res.status(201).json({
            message: 'User added successfully. They can now log in.',
            user: mapUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /users/search?q=xxx — admin searches users by name or email
exports.searchUsers = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);

        const { q, email } = req.query;
        const term = (q || email || '').trim();
        if (!term) return res.status(400).json({ message: 'Search query is required' });

        const regex = { $regex: term, $options: 'i' };
        const users = await User.find(
            { $or: [{ fullName: regex }, { email: regex }] },
            USER_PUBLIC_FIELDS
        ).limit(20);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /users/:id/requests — admin fetches all requests for a specific user
exports.getUserRequests = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);

        const { id } = req.params;
        const requests = await Request.find({ userId: id })
            .populate('resourceId')
            .sort({ createdAt: -1 });

        const mapped = requests.map(item => ({
            ...item.toObject(),
            id: item._id.toString(),
            resource: item.resourceId,
            quantity_requested: item.quantity_requested
        }));

        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /users/me — authenticated user fetches own profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, USER_PUBLIC_FIELDS);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Handle common profile update logic
const handleProfileUpdate = async ({ req, res, user }) => {
    const { fullName, phone, address } = req.body;

    // Update text fields
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Update file fields
    const files = req.files || {};
    if (files.profilePhoto?.[0]) user.profilePhotoUrl = getUploadedUrl(files.profilePhoto[0]);
    if (files.aadhaarPhoto?.[0]) user.aadhaarPhotoUrl = getUploadedUrl(files.aadhaarPhoto[0]);
    if (files.panCardPhoto?.[0]) user.panCardPhotoUrl = getUploadedUrl(files.panCardPhoto[0]);

    await user.save();

    return res.status(200).json({
        message: 'Profile updated successfully',
        user: mapUserResponse(user)
    });
};

// PUT /users/me/profile — authenticated user updates own profile
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await handleProfileUpdate({ req, res, user });
    } catch (error) {
        console.error('Error in updateMyProfile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// PUT /users/:id/profile — admin updates a user's profile
exports.updateUserProfile = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await handleProfileUpdate({ req, res, user });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// PUT /users/role-by-email — admin grants/revokes admin access by email
exports.updateRoleByEmail = async (req, res) => {
    try {
        if (!isSuperAdmin(req)) return accessDenied(res, 'Access denied: Only super admin can manage roles');

        const { email, role } = req.body;
        if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Email is required' });
        if (!role || !['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found with this email' });

        user.role = role;
        await user.save();

        res.status(200).json({
            message: 'User role updated successfully',
            user: mapUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/:id/role — admin updates role by ID
exports.updateUserRole = async (req, res) => {
    try {
        if (!isSuperAdmin(req)) return accessDenied(res, 'Access denied: Only super admin can manage roles');

        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.status(200).json({
            message: 'User role updated successfully',
            user: mapUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /users/:id — admin deletes a user
exports.deleteUser = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);

        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Protect super admin from deletion
        if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Cannot delete the super admin account' });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/:id/allowed — Admin approves/activates a user or toggles their active status
exports.updateUserAllowedStatus = async (req, res) => {
    try {
        if (!isAdmin(req)) return accessDenied(res);

        const { id } = req.params;
        const { isAllowed } = req.body;

        if (isAllowed === undefined || typeof isAllowed !== 'boolean') {
            return res.status(400).json({ message: 'isAllowed (boolean) is required' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from disabling themselves
        if (user._id.toString() === req.user.id && !isAllowed) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        user.isAllowed = isAllowed;
        await user.save();

        res.status(200).json({
            message: `User ${isAllowed ? 'activated' : 'deactivated'} successfully`,
            user: mapUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
