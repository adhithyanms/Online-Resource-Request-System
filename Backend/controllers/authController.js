const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "devconnect_jwt_secret_key_2024_secure_token",
    { expiresIn: "24h" }
  );
};

const SUPER_ADMIN_EMAIL = "adhithyanshanmugam@gmail.com";

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Block login if not allowed by admin
    if (!user.isAllowed) {
      return res.status(403).json({
        message: "Your account has not been activated by admin. Please contact the administrator."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleSignin = async (req, res) => {
  try {
    const { email, fullName, googleId } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Existing user — check if allowed
      if (!user.isAllowed) {
        return res.status(403).json({
          message: "Your account has not been activated by admin. Please contact the administrator."
        });
      }

      // Update fullName if not already set
      if (!user.fullName && fullName) {
        user.fullName = fullName;
        await user.save();
      }
    } else {
      // New user via Google — only allow admin to auto-register
      const isAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;
      if (!isAdmin) {
        return res.status(403).json({
          message: "Your account has not been activated by admin. Please contact the administrator."
        });
      }

      user = new User({
        email: normalizedEmail,
        fullName,
        role: "admin",
        isAllowed: true,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
      });
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
