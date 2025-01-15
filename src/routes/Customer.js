const express = require("express");
const { getProfile } = require("../controllers/Customer");
const router = express.Router();
const { validateUserRequest } = require("../middleware/Auth");
router.route("/getProfile").get(validateUserRequest, getProfile);
module.exports = router;
