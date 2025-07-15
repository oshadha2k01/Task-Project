const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");
const crypto = require("crypto");

// Generate 2FA
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `TaskApp (${user.email})`,
      issuer: "TaskApp",
      length: 32,
    });

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA setup not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid token" });
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    res.json({
      message: "2FA enabled successfully",
      backupCodes: user.backupCodes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bcrypt = require("bcrypt");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.isTwoFactorEnabled) {
      let verified = false;

      if (token) {
        if (user.backupCodes.includes(token.toUpperCase())) {
          user.backupCodes = user.backupCodes.filter(
            (code) => code !== token.toUpperCase()
          );
          verified = true;
        } else {
          verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2,
          });
        }

        if (!verified) {
          return res.status(400).json({ error: "Invalid token" });
        }
      }
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      isEnabled: user.isTwoFactorEnabled || false,
      hasBackupCodes: user.backupCodes && user.backupCodes.length > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
