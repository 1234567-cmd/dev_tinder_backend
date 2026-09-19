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

module.exports = { userAuth };
