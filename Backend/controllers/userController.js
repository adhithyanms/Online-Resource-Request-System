const User = require('../models/User');
const Request = require('../models/Request');
const bcrypt = require('bcryptjs');
const path = require('path');

const SUPER_ADMIN_EMAIL = 'adhithyanshanmugam@gmail.com';

const isAdmin = (req) => req.user?.role === 'admin' || req.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

// Helper: build file URL from request and filename
const fileUrl = (req, filename) => {
    if (!filename) return '';
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// GET /users — get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find(
            {},
            'email fullName role isAllowed phone address profilePhotoUrl aadhaarPhotoUrl panCardPhotoUrl createdAt'
        ).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /users — admin adds a user by email only
exports.addAllowedUser = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }

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
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                isAllowed: user.isAllowed
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /users/search?q=xxx — admin searches users by name or email
exports.searchUsers = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { q, email } = req.query;
        const term = (q || email || '').trim();
        if (!term) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const regex = { $regex: term, $options: 'i' };
        const users = await User.find(
            { $or: [{ fullName: regex }, { email: regex }] },
            'email fullName role isAllowed phone address profilePhotoUrl aadhaarPhotoUrl panCardPhotoUrl createdAt'
        ).limit(20);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /users/:id/requests — admin fetches all requests for a specific user
exports.getUserRequests = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }

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
        const user = await User.findById(
            req.user.id,
            'email fullName role phone address profilePhotoUrl aadhaarPhotoUrl panCardPhotoUrl createdAt'
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/me/profile — authenticated user updates own profile
exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, phone, address } = req.body;
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        const files = req.files || {};
        if (files.profilePhoto?.[0]) user.profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
        if (files.aadhaarPhoto?.[0]) user.aadhaarPhotoUrl = `/uploads/${files.aadhaarPhoto[0].filename}`;
        if (files.panCardPhoto?.[0]) user.panCardPhotoUrl = `/uploads/${files.panCardPhoto[0].filename}`;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                profilePhotoUrl: user.profilePhotoUrl,
                aadhaarPhotoUrl: user.aadhaarPhotoUrl,
                panCardPhotoUrl: user.panCardPhotoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/:id/profile — admin updates a user's profile
exports.updateUserProfile = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { fullName, phone, address } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Text fields
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        // File fields — only update if new file was uploaded
        const files = req.files || {};
        if (files.profilePhoto?.[0]) {
            user.profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
        }
        if (files.aadhaarPhoto?.[0]) {
            user.aadhaarPhotoUrl = `/uploads/${files.aadhaarPhoto[0].filename}`;
        }
        if (files.panCardPhoto?.[0]) {
            user.panCardPhotoUrl = `/uploads/${files.panCardPhoto[0].filename}`;
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                profilePhotoUrl: user.profilePhotoUrl,
                aadhaarPhotoUrl: user.aadhaarPhotoUrl,
                panCardPhotoUrl: user.panCardPhotoUrl,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/role-by-email — admin grants/revokes admin access by email
exports.updateRoleByEmail = async (req, res) => {
    try {
        if (req.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Only super admin can manage roles' });
        }

        const { email, role } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: 'User role updated successfully',
            user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /users/:id/role — admin updates role by ID
exports.updateUserRole = async (req, res) => {
    try {
        if (req.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Only super admin can manage roles' });
        }

        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: 'User role updated successfully',
            user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /users/:id — admin deletes a user
exports.deleteUser = async (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: 'Access denied' });
        }

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
