const { handleException } = require("../../util/helper");
const { getCustomerUserId } = require("./Customer");
const db = require("../db/connect");
const addAddress = async (req, res) => {
  try {
    const userId = getCustomerUserId(req);
    const { data } = req.body;
    let sql = " insert into addresses (user_id,";
    let sqlValues = " ) values( ? ,";
    let params = [userId];
    Object.keys(data).forEach((key) => {
      sql += `${key},`;
      sqlValues += " ? ,";
      params.push(data[key]);
    });
    sql =
      sql.substring(0, sql.length - 1) +
      sqlValues.substring(0, sqlValues.length - 1) +
      ")";
    await db.executeQuery(sql, params);
    res.status(200).json({ message: "added successfully!" });
  } catch (e) {
    handleException(e, "Address-controller-addAddress");
  }
};

const getAddress = async (req, res) => {
  try {
    const userId = getCustomerUserId(req);
    const sql =
      "select * from addresses where user_id = ? order by address_id asc ";
    const address = await db.executeQuery(sql, [userId]);
    if (address.error || !address.data.length) {
      return res.status(404).json({ message: "address list is empty!" });
    }
    res.status(200).json({ addresses: address.data });
  } catch (e) {
    handleException(e, "Address-controller-getAddress");
  }
};

module.exports = { addAddress, getAddress };
