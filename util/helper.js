const bcrypt = require("bcrypt");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "laundry1212";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "laundry1212";

const encryptPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const checkPassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

const encodeBase64 = (input) => {
  return btoa(input);
};

// Function to decode from Base64
const decodeBase64 = (input) => {
  return atob(input);
};

const handleException = (res, functionName, message) => {
  return res.status(405).json({ message: `${functionName}: ${message}` });
};

module.exports = {
  encryptPassword,
  encodeBase64,
  decodeBase64,
  checkPassword,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  handleException,
};
