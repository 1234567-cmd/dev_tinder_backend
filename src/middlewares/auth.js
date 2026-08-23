const isAdmin = (req, res, next) => {
  const token = "vbn";

  if (token === "vbn") {
    console.log("Admin authenticated");

    return next();
  }

  return res.status(401).send("Unauthorized");
};

module.exports = { isAdmin };