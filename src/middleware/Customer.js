const { handleException, ACCESS_TOKEN_SECRET } = require("../../util/helper");
const jwt = require("jsonwebtoken");

const validateUserRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Access token required" });
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Invalid or expired access token" });

      next();
    });
  } catch (e) {
    handleException(res, "Auth-middleware-validateUserRequest", e);
  }
};

const validateEditProfile = async (req, res, next) => {
  try {
    if (req.body?.data && Object.keys(req.body.data).length) {
      next();
    } else {
      res.status(401).json({ message: "data required!" });
    }
  } catch (e) {
    handleException(res, "Customer-middleware-validateEditProfile", e);
  }
};

module.exports = { validateUserRequest, validateEditProfile };
