const express = require("express");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);

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
