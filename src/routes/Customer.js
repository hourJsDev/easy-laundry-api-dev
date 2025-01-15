const express = require("express");
const { getProfile, editProfile } = require("../controllers/Customer");
const router = express.Router();
const {
  validateUserRequest,
  validateEditProfile,
} = require("../middleware/Customer");
router.route("/getProfile").get(validateUserRequest, getProfile);
router
  .route("/editProfile")
  .put(validateUserRequest, validateEditProfile, editProfile);
module.exports = router;
