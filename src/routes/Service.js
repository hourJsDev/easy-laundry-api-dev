const express = require("express");
const {
  addService,
  getService,
  editService,
  addItem,
  addIemToService,
  getServiceDetail,
  editServiceDetail,
} = require("../controllers/Service");
const {
  validateAddService,
  validateEditService,
  validateAddItem,
  validateAddItemToService,
  validateGetServiceDetail,
  validateEditServiceDetail,
} = require("../middleware/Service.");
const router = express.Router();

router.route("/addService").post(validateAddService, addService);
router.route("/addItem").post(validateAddItem, addItem);
router
  .route("/addItemToService")
  .post(validateAddItemToService, addIemToService);
router.route("/getService").get(getService);
router.route("/editService").put(validateEditService, editService);
router
  .route("/getServiceDetail")
  .get(validateGetServiceDetail, getServiceDetail);
router
  .route("/editServiceDetail")
  .put(validateEditServiceDetail, editServiceDetail);

module.exports = router;
