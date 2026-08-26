const express = require("express");

const app = express();

const { isAdmin } = require("./middlewares/auth");

const connectDB = require("./config/database");

const User = require("./models/user")
const bcrypt = require("bcrypt");
const { validateSignUpData ,validateLoginData} = require("./utils/validation");

app.use(express.json())

// Pull the human-readable message(s) out of a Mongoose error
const getErrorMessage = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors)
      .map((e) => e.message)
      .join(", ");
  }
  return error.message;
};

app.post("/signup", async (req, res) => {
  try {
    // 1. Validate the raw request data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // 2. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create the user with the hash (never the plaintext)
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.status(201).send("User added successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(getErrorMessage(error));
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});

    console.log(users);

    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});


app.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.get("/user", async (req, res) => {
  try {
    const emailId = req.query.emailId;

    if (!emailId) {
      return res.status(400).send("emailId query param is required");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

app.patch("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "skills",
      "about",
      "emailId"
    ];

    const isUpdateAllowed = Object.keys(data).every((field) =>
      ALLOWED_UPDATES.includes(field)
    );

    if (!isUpdateAllowed) {
      return res.status(400).send("Update not allowed");
    }

    if (data.skills && data.skills.length > 10) {
      return res.status(400).send("Max 10 skills allowed");
    }

    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send(getErrorMessage(error));
  }
});

app.delete("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

app.post('/login', async (req, res) => {
  try {
    validateLoginData(req)
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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
