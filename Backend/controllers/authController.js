const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'devconnect_jwt_secret_key_2024_secure_token',
        { expiresIn: '24h' }
    );
};


exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.status(200).json({
            token,
            id: user._id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.googleSignin = async (req, res) => {
    try {
        const { email, fullName, googleId } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            const emailRegex = /^[a-z]+\.(it|cs|ee|ec|cd|cb|ad|al|fd)(22|23|24|25|26)@bitsathy\.ac\.in$/;
            const isAdmin = email.toLowerCase() === 'adhithyanshanmugam@gmail.com';

            if (!isAdmin && !emailRegex.test(email)) {
                return res.status(400).json({ message: 'Error: Invalid email format!' });
            }

            // Determine role
            let role = 'user';
            if (isAdmin) {
                role = 'admin';
            }

            user = new User({
                email,
                fullName,
                role,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10) // Random password for oauth users
            });
            await user.save();
        }

        const token = generateToken(user);

        res.status(200).json({
            token,
            id: user._id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
