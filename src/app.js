const express = require("express");

const app = express();

const { userAuth } = require("./middlewares/auth");

const connectDB = require("./config/database");

const User = require("./models/user")
const bcrypt = require("bcrypt");
const { validateSignUpData, validateLoginData } = require("./utils/validation");

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post('/login', async (req, res) => {
  try {
    validateLoginData(req)
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { _id: user._id },
      "VBHHJHHJHGHGHJG",
      { expiresIn: "7d" }
    );
   res.cookie("token", token);
  
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Returns the currently logged-in user (populated by userAuth from the token cookie)
app.get("/profile", userAuth, (req, res) => {
  res.send(req.user);
});

connectDB()
  .then(() => {
    console.log("Database Connected");
    app.listen(3000, () => {
      console.log("Server is set on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected", err);
  });

