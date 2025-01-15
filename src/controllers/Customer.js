const db = require("../db/connect");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, handleException } = require("../../util/helper");

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
    handleException(res, "Customer-controller-getCustomerUserId", e);
  }
};

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
    handleException(res, "Customer-controller-getProfile", e);
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = getCustomerUserId(req);
    const { data } = req.body;
    let sql = "update users set ";
    let params = [];
    Object.keys(data).forEach((key) => {
      sql += ` ${key} = ? ,`;
      params.push(profile[key]);
    });
    sql = sql.substring(0, sql.length - 1) + " where user_id = ? ";
    params.push(userId);
    await db.executeQuery(sql, params);
    res.status(200).json({ message: "edit successfully!" });
  } catch (e) {
    handleException(res, "Customer-controller-editProfile", e);
  }
};

module.exports = { getCustomerUserId, getProfile, editProfile };
