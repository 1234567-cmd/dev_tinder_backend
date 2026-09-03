const validator = require("validator");

// Validates the raw signup payload. Throws an Error with a readable message
// on the first problem found; returns normally when everything is valid.
const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body || {};

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }

  if (firstName.length < 2 || firstName.length > 50) {
    throw new Error("First name must be 2-50 characters");
  }

  if (lastName.length < 2 || lastName.length > 50) {
    throw new Error("Last name must be 2-50 characters");
  }

  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new Error(
      "Password is weak: use at least 8 characters with uppercase, lowercase, a number and a symbol"
    );
  }
};

const validateLoginData = (req) => {
  const { emailId, password } = req.body || {};
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }

  // Strength is enforced at signup only; on login just require a value so a
  // mistyped password reports "Invalid email or password" rather than "weak".
  if (!password) {
    throw new Error("Password is required");
  }
};


module.exports = { validateSignUpData, validateLoginData };
