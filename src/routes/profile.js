const express = require("express");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();


profileRouter.get("/profile/view", userAuth, (req, res) => {
  res.json({ data: req.user });
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);

    const user = req.user;
    Object.entries(req.body).forEach(([field, value]) => {
      user[field] = value;
    });

    await user.save();

    res.json({
      message: `${user.firstName}, your profile was updated successfully`,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = profileRouter;
