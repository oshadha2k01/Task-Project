const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({ 
          requires2FA: true,
          message: "2FA token required" 
        });
      }

      // Verify 2FA token
      let verified = false;

      // Check if it's a backup code
      if (user.backupCodes.includes(twoFactorToken.toUpperCase())) {
        // Remove used backup code
        user.backupCodes = user.backupCodes.filter(code => code !== twoFactorToken.toUpperCase());
        await user.save();
        verified = true;
      } else {
        // Verify TOTP token
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 2
        });
      }

      if (!verified) {
        return res.status(400).json({ error: "Invalid 2FA token" });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name,
        isTwoFactorEnabled: user.isTwoFactorEnabled 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      username: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
