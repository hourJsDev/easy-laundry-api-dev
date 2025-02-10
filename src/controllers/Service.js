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
    const service = await db.executeQuery(sql, []);
    if (service.error || !service.data.length) {
      return res.status(404).json({ message: "service list is empty!" });
    }
    res.status(200).json({ services: service.data });
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

const addItem = async (req, res) => {
  try {
    const { data } = req.body;
    let sql = " insert into items (";
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
    handleException(res, "Service-controller-addItem", e);
  }
};

const addIemToService = async (req, res) => {
  try {
    const { data } = req.body;
    let sql = " insert into item_to_service (";
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
    handleException(res, "Service-controller-addIemToService", e);
  }
};

const editServiceDetail = async (req, res) => {
  try {
    const { item_to_service_id, price } = req.body;
    const sql =
      "update item_to_service set base_price = ? , updated_at = now() where item_to_service_id = ? ";
    await db.executeQuery(sql, [price, item_to_service_id]);
    res.status(200).json({ message: "edited successfully!" });
  } catch (e) {
    handleException(res, "Service-controller-editItemInService", e);
  }
};

const getServiceDetail = async (req, res) => {
  try {
    const { service_id } = req.body;
    const sql =
      " select s.service_id , i.item_id , i.item_name , i.image , its.base_price from services s " +
      " inner join item_to_service its on its.service_id = s.service_id " +
      " inner join items i on i.item_id = its.item_id where s.service_id = ? ";
    const serviceDetail = await db.executeQuery(sql, [service_id]);
    if (serviceDetail.error || !serviceDetail.data.length) {
      return res.status(404).json({ message: "service list is empty!" });
    }
    res.status(200).json({ service_detail: serviceDetail.data });
  } catch (e) {
    handleException(e, "Service-controller-getServiceDetail");
  }
};

module.exports = {
  addService,
  getService,
  editService,
  addItem,
  addIemToService,
  getServiceDetail,
  editServiceDetail,
};
