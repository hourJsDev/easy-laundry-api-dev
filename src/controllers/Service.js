const { handleException } = require("../../util/helper");
const db = require("../db/connect");
const addService = async (req, res) => {
  try {
    const { data } = req.body;
    let sql = " insert into services (";
    let sqlValues = " ) values(";
    let params = [];
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
    handleException(res, "Service-controller-addService", e);
  }
};

const getService = async (req, res) => {
  try {
    const sql = "select * from services  ";
    const address = await db.executeQuery(sql, [], res);
    if (address.error || !address.data.length) {
      return res.status(404).json({ message: "service list is empty!" });
    }
    res.status(200).json({ addresses: address.data });
  } catch (e) {
    handleException(e, "Service-controller-getService");
  }
};

const editService = async (req, res) => {
  try {
    const { data, service_id } = req.body;
    let sql = "update services set updated_at = now() , ";
    let params = [];
    Object.keys(data).forEach((key) => {
      sql += ` ${key} = ? ,`;
      params.push(data[key]);
    });
    sql = sql.substring(0, sql.length - 1) + " where service_id = ? ";
    params.push(service_id);
    await db.executeQuery(sql, params);
    res.status(200).json({ message: "edit successfully!" });
  } catch (e) {
    handleException(res, "Service-controller-editService", e);
  }
};

module.exports = { addService, getService, editService };
