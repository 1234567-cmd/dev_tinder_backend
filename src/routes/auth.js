const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/user");
const { validateSignUpData, validateLoginData } = require("../utils/validation");

const authRouter = express.Router();

// Signs a 7-day JWT and stores it in the "token" cookie that the userAuth middleware reads.
const setAuthCookie = (res, user) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token);
};

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
      return res.status(400).json({ message: "Max 10 skills allowed" });
    }

    // 2. Reject emails that are already registered (stored emails are trimmed and lowercased)
    const existingUser = await User.findOne({ emailId: emailId.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // 3. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create the user with the hash (never the plaintext)
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

    // 5. Log the new user in straight away, the same way /login does.
    setAuthCookie(res, user);

    // toJSON on the User schema strips the password hash before sending.
    res.status(201).json({ message: "User added successfully", data: user });
  } catch (error) {
    console.error(error);
    // 11000 is MongoDB's duplicate key error (emailId is unique) - covers two signups racing each other.
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    res.status(400).json({ message: error.message });
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

    setAuthCookie(res, user);

    // toJSON on the User schema strips the password hash before sending.
    res.status(200).json({ message: "Logged in successfully", data: user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout",async (req,res) =>{
  try {
    res.clearCookie('token', {
    httpOnly: true,
    //secure: true, // true in production
    sameSite: 'strict'
  });
  res.send("Logout Successfully")
  } catch (err){
    res.send(err.message)
  }
} )

module.exports = authRouter;
