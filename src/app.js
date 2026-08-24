const express = require("express");

const app = express();

const { isAdmin } = require("./middlewares/auth");

const connectDB = require("./config/database");

const User = require("./models/user")

app.use(express.json())

app.post("/signup", async (req, res) => {
  const user = new User(req.body)
  await user.save()
  res.send("user added")
})
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
