const { handleException } = require("../../util/helper");

const validateAddService = async (req, res, next) => {
  try {
    if (req.body?.data && Object.keys(req.body.data).length) {
      next();
    } else {
      res.status(401).json({ message: "data required!" });
    }
  } catch (e) {
    handleException(e, "Service-middleware-validateAddService");
  }
};

const validateEditService = async (req, res, next) => {
  try {
    if (
      req.body?.data &&
      Object.keys(req.body.data).length &&
      req.body?.service_id
    ) {
      next();
    } else {
      res.status(401).json({ message: "service_id and data required!" });
    }
  } catch (e) {
    handleException(res, "Address-middleware-validateEditService", e);
  }
};

module.exports = { validateAddService, validateEditService };
