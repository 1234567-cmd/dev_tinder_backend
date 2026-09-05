const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { validateSignUpData, validateLoginData } = require("../utils/validation");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // 1. Validate the raw request data
    validateSignUpData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      skills,
      about,
    } = req.body;

    if (skills && skills.length > 10) {
      return res.status(400).send("Max 10 skills allowed");
    }

    // 2. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create the user with the hash (never the plaintext)
    // Optional profile fields are passed through; Mongoose skips undefined ones.
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      skills,
      about,
    });

    await user.save();
    res.status(201).send("User added successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ _id: user._id }, "VBHHJHHJHGHGHJG", {
      expiresIn: "7d",
    });
    res.cookie("token", token);

    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = authRouter;
