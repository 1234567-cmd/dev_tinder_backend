const express = require("express");

const app = express();

const { isAdmin } = require("./middlewares/auth");

app.get("/user", isAdmin, (req, res) => {
  console.log(req.query);

  res.send("getusers");
});

app.listen(3000, () => {
  console.log("Server is set on port 3000");
});