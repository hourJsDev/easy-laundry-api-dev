const express = require("express");
const router = express.Router();
const {
  login,
  register,
  verifyRegisterOTP,
  exchangeRefreshToken,
} = require("../controllers/Auth");

router.route("/login").get(login);
router.route("/register").post(register);
router.route("/verifyRegisterOTP").get(verifyRegisterOTP);
router.route("/refreshToken").get(exchangeRefreshToken);

module.exports = router;
