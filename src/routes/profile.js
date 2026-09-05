const express = require("express");

const { userAuth } = require("../middlewares/auth");

const profileRouter = express.Router();

// Returns the currently logged-in user (populated by userAuth from the token cookie)
profileRouter.get("/profile", userAuth, (req, res) => {
  res.send(req.user);
});

module.exports = profileRouter;
