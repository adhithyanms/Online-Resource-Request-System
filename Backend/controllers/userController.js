const User = require('../models/User');

const SUPER_ADMIN_EMAIL = 'adhithyanshanmugam@gmail.com';

// Get all users (super-admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Allow only the designated super admin to manage users
        if (req.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Only admin adhithyanshanmugam@gmail.com can manage users' });
        }

        const users = await User.find({}, 'email fullName role createdAt').sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role by email (super-admin only) - grant/revoke admin access through email
exports.updateRoleByEmail = async (req, res) => {
    try {
        // Allow only the designated super admin to manage users
        if (req.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Only admin adhithyanshanmugam@gmail.com can manage users' });
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
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role by id (super-admin only)
exports.updateUserRole = async (req, res) => {
    try {
        // Allow only the designated super admin to manage users
        if (req.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied: Only admin adhithyanshanmugam@gmail.com can manage users' });
        }

        const { id } = req.params;
        const { role } = req.body;

        // Validate role
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
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
