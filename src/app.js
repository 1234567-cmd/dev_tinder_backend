const express = require("express");

const app = express();

const { isAdmin } = require("./middlewares/auth");

const connectDB = require("./config/database");

const User = require("./models/user")

app.use(express.json())

app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send("User added successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error saving the user");
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
    res.status(400).send("Error updating the user");
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
