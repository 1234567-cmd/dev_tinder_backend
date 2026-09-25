const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies || {};

    if (!token) {
      return res.status(401).send("Please login first");
    }
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).send("User not found");
    }
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};

// Like userAuth, but lets guests through: sets req.user when a valid token is present,
// otherwise leaves it undefined instead of answering 401.
const optionalAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies || {};
    if (token) {
      const { _id } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = (await User.findById(_id)) || undefined;
    }
  } catch (error) {
    req.user = undefined;
  }
  return next();
};

module.exports = { userAuth, optionalAuth };
