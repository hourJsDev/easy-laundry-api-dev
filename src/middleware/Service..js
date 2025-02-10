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

const validateAddItem = async (req, res, next) => {
  try {
    if (req.body?.data && Object.keys(req.body.data).length) {
      next();
    } else {
      res.status(401).json({ message: "data required!" });
    }
  } catch (e) {
    handleException(e, "Service-middleware-validateAddItem");
  }
};

const validateAddItemToService = async (req, res, next) => {
  try {
    if (
      req.body?.data &&
      Object.keys(req.body.data).length &&
      req.body.data.item_id &&
      req.body.data.service_id
    ) {
      next();
    } else {
      res.status(401).json({ message: "data required!" });
    }
  } catch (e) {
    handleException(e, "Service-middleware-validateAddItemToService");
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

const validateGetServiceDetail = async (req, res, next) => {
  try {
    if (req.body?.service_id) {
      next();
    } else {
      res.status(401).json({ message: "service_id and required!" });
    }
  } catch (e) {
    handleException(res, "Address-middleware-validateEditService", e);
  }
};
const validateEditServiceDetail = async (req, res, next) => {
  try {
    if (req.body?.item_to_service_id && req.body?.price) {
      next();
    } else {
      res
        .status(401)
        .json({ message: "item_to_service_id and price required!" });
    }
  } catch (e) {
    handleException(res, "Address-middleware-validateEditService", e);
  }
};

module.exports = {
  validateAddService,
  validateEditService,
  validateAddItem,
  validateAddItemToService,
  validateEditServiceDetail,
  validateGetServiceDetail,
};
