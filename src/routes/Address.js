const express = require("express");
const {
  addAddress,
  getAddress,
  editAddress,
} = require("../controllers/Address");
const { validateUserRequest } = require("../middleware/Customer");
const {
  validateAddAddress,
  validateEditAddress,
} = require("../middleware/Address");
const router = express.Router();

router
  .route("/addAddress")
  .post(validateUserRequest, validateAddAddress, addAddress);
router.route("/getAddress").get(validateUserRequest, getAddress);
router
  .route("/editAddress")
  .put(validateUserRequest, validateEditAddress, editAddress);

module.exports = router;
