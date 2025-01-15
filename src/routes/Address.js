const express = require("express");
const { addAddress, getAddress } = require("../controllers/Address");
const { validateUserRequest } = require("../middleware/Customer");
const { validateAddAddress } = require("../middleware/Address");
const router = express.Router();

router
  .route("/addAddress")
  .post(validateUserRequest, validateAddAddress, addAddress);
router.route("/getAddress").get(validateUserRequest, getAddress);

module.exports = router;
