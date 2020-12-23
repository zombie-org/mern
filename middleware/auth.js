const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // get token from header
  const token = req.header("x-auth-token");

  // check if no token

  if (!token) {
    return res.status(401).json({ msg: "No token, Access denied" });
  }

  // check if invalid token
  try {
    const decoded = jwt.verify(token, config.get("jwtToken"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token, Access denied" });
  }
};
