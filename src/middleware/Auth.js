const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SECRET } = require("../../util/helper");
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
    console.log(e);
  }
};

module.exports = { validateUserRequest };
