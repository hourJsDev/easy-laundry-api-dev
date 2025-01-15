const { handleException } = require("../../util/helper");

const validateAddAddress = async (req, res, next) => {
  try {
    if (req.body?.data && Object.keys(req.body.data).length) {
      next();
    } else {
      res.status(401).json({ message: "data required!" });
    }
  } catch (e) {
    handleException(e, "Address-middleware-validateAddAddress");
  }
};

module.exports = { validateAddAddress };
