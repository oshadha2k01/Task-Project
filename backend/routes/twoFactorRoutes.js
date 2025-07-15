const express = require("express");
const {
  generate2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
} = require("../controllers/twoFactorController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/status", authenticateToken, get2FAStatus);
router.post("/generate", authenticateToken, generate2FA);
router.post("/verify", authenticateToken, verify2FA);
router.post("/disable", authenticateToken, disable2FA);

module.exports = router;
