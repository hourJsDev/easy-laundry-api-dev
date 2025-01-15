const db = require("../db/connect");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../../util/helper");
const getProfile = async (req, res) => {
  try {
    const userId = getCustomerUserId(req);
    const sql = "select * from users where user_id = ? ";
    const user = await db.executeQuery(sql, [userId]);
    if (user.error || !user.data.length) {
      return res.status(404).json({ message: "user not found!" });
    }
    res.status(200).json({ ...user.data[0] });
  } catch (e) {
    console.log(e);
  }
};

const getCustomerUserId = (req) => {
  try {
    const authHeader = req.headers["authorization"];
    let id = 0;
    const token = authHeader && authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return 0;
      id = user.id;
    });
    return id;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

module.exports = { getCustomerUserId, getProfile };
