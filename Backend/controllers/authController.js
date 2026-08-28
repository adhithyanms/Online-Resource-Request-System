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
          message: "Your account registration request is pending admin approval. Please wait for activation."
        });
      }

      // Update fullName if not already set
      if (!user.fullName && fullName) {
        user.fullName = fullName;
        await user.save();
      }
    } else {
      // New user via Google — only super admin is allowed immediately, normal users are created inactive
      const isAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;
      
      user = new User({
        email: normalizedEmail,
        fullName: fullName || "",
        role: isAdmin ? "admin" : "user",
        isAllowed: isAdmin,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
      });
      await user.save();

      if (!isAdmin) {
        return res.status(403).json({
          message: "Your account registration request has been submitted to the admin. Please wait for activation."
        });
      }
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

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (!existingUser.isAllowed) {
        return res.status(400).json({
          message: "An account activation request for this email has already been submitted and is pending admin approval."
        });
      } else {
        return res.status(400).json({
          message: "An account with this email is already registered and activated. Please log in."
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      fullName: fullName || "",
      role: "user",
      isAllowed: false,
    });

    await user.save();

    res.status(201).json({
      message: "Registration request submitted successfully. Please wait for admin approval before logging in."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
