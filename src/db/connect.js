const express = require("express");
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost", // Your MySQL host (e.g., 'localhost')
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "laundry_database", // Your database name
});

process.on("SIGINT", () => {
  console.log("Shutting down the server...");
  pool.end((err) => {
    if (err) {
      console.error("Error closing the pool", err);
    } else {
      console.log("MySQL connection pool closed.");
    }
    process.exit(0); // Exit the process after pool has closed
  });
});

const querySelect = async (query, params) => {
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          reject({ error: true, message: "Query failed", details: err });
        } else {
          resolve({ error: false, data: results });
        }
      });
    });
    return result;
  } catch (e) {
    console.log(e);
  }
};
const executeQuery = async (query, params) => {
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          reject({ error: true, message: "Query failed", details: err });
        } else {
          resolve({ error: false, data: results });
        }
      });
    });
    return result;
  } catch (e) {
    console.log("Unexpected error:", e);
    return { error: true, message: "Unexpected error", details: e };
  }
};

module.exports = { querySelect, executeQuery };
