const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const crypto = require('crypto');

// Generate 2FA secret and QR code
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `TaskApp (${user.email})`,
      issuer: 'TaskApp',
      length: 32
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Save secret temporarily (not enabled until verified)
    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify and enable 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA setup not initiated' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    await user.save();

    res.json({ 
      message: '2FA enabled successfully',
      backupCodes: user.backupCodes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Verify 2FA token if provided, or allow backup code
    if (user.isTwoFactorEnabled) {
      let verified = false;

      if (token) {
        // Check if it's a backup code
        if (user.backupCodes.includes(token.toUpperCase())) {
          // Remove used backup code
          user.backupCodes = user.backupCodes.filter(code => code !== token.toUpperCase());
          verified = true;
        } else {
          // Verify TOTP token
          verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
          });
        }

        if (!verified) {
          return res.status(400).json({ error: 'Invalid token' });
        }
      }
    }

    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      isEnabled: user.isTwoFactorEnabled || false,
      hasBackupCodes: user.backupCodes && user.backupCodes.length > 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
