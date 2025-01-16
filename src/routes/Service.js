const express = require("express");
const {
  addService,
  getService,
  editService,
} = require("../controllers/Service");
const {
  validateAddService,
  validateEditService,
} = require("../middleware/Service.");
const router = express.Router();

router.route("/addService").post(validateAddService, addService);
router.route("/getService").get(getService);
router.route("/editService").put(validateEditService, editService);

module.exports = router;
