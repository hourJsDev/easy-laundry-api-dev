const {
  encryptPassword,
  decodeBase64,
  checkPassword,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../../util/helper");
const jwt = require("jsonwebtoken");
const db = require("../db/connect");

let refreshTokens = [];

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.querySelect(
      "select * from users where phone = ? ",
      [username]
    );
    let user = {};
    if (
      result &&
      result.data &&
      result.data.length &&
      result.data[0].password_hash
    ) {
      const isMatch = await checkPassword(
        password,
        result.data[0].password_hash
      );
      if (!isMatch) {
        return res.json({ error: true, message: "password is incorrect!" });
      }

      user = result.data[0];
    } else {
      return res.json({
        error: true,
        message: "Couldn't find your account! Please register!",
      });
    }
    const accessToken = generateAccessToken({
      id: user.user_id,
      username: user.phone,
    });
    const refreshToken = generateRefreshToken({
      id: user.user_id,
      username: user.phone,
    });
    refreshTokens.push(refreshToken);

    res.json({
      status: 200,
      profile: user,
      refreshToken,
      accessToken,
    });
  } catch (e) {
    console.log("login: ", e);
  }
};

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    const password = await encryptPassword(req.body.password);
    const values = [first_name, last_name, email, phone, password];
    const checkExist = await checkExistCustomer(phone, email);
    if (!checkExist.error) {
      const sql =
        "insert into users (first_name,last_name,email,phone,password_hash) values(?,?,?,?,?)";
      await db.executeQuery(sql, values);
      res.json({ error: false, message: "register successfully!" });
    }
    res.json({ error: true, message: "register failed!" });
  } catch (e) {
    console.log("Register: ", e);
  }
};

const verifyRegisterOTP = async (req, res) => {
  try {
    validateRequest(req.body, res, "verifyOTP");
    const { email, phone } = req.body;
    const code = decodeBase64(req.body.code);
    const result = await checkExistCustomer(phone, email);

    if (result.error) {
      /// something
    } else {
      /// sent sms
    }
    res.json({ ...result, ...sms });
  } catch (e) {
    console.log(e);
  }
};

const checkExistCustomer = async (phone, email) => {
  try {
    const sql =
      "select count(*) as count_user  from users u where u.phone = ? or u.email = ? ";
    const result = await db.executeQuery(sql, [phone, email]);
    if (result.data && result.data.length && result.data[0].count_user) {
      return { message: "phone or email already exist!", error: true };
    }
    return { error: false };
  } catch (e) {
    console.log(e);
    return { error: true };
  }
};

const validateRequest = (params, res, type) => {
  try {
    if (
      type === "verifyOTP" &&
      (!params?.email || !params?.phone || !params.code)
    ) {
      return res.status(401).json({
        message: "phone , code , email is required!",
      });
    } else if (type === "refreshToken" && !params?.token) {
      return res.status(401).json({ message: "Refresh token is required" });
    }
  } catch (e) {
    console.log(e);
  }
};

const exchangeRefreshToken = (req, res) => {
  try {
    validateRequest(req.body, res, "refreshToken");
    const { token } = req.body;

    // Validate the refresh token
    if (!refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Verify the token
    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Token is no longer valid" });

      // Generate a new access token
      refreshTokens = refreshTokens.filter((rft) => rft !== token);
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokens.push(refreshToken); // Store it (use a database in production)
  return refreshToken;
};

module.exports = { login, register, verifyRegisterOTP, exchangeRefreshToken };
