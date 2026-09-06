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


  if (!password) {
    throw new Error("Password is required");
  }
};

// Fields a user may change through PATCH /profile/edit. emailId and password
// are deliberately excluded - they need their own flows (verification, hashing).
const EDITABLE_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "skills",
  "about",
];

// Validates the edit-profile payload. Throws on the first problem found.
// Type/format rules that live on the schema (age min, gender enum, photoUrl)
// are left to Mongoose so they are not duplicated here.
const validateEditProfileData = (req) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object");
  }

  const fields = Object.keys(body);
  if (fields.length === 0) {
    throw new Error("No fields provided to update");
  }

  const notAllowed = fields.filter((f) => !EDITABLE_PROFILE_FIELDS.includes(f));
  if (notAllowed.length > 0) {
    throw new Error(
      `Cannot update field(s): ${notAllowed.join(", ")}. ` +
        `Allowed: ${EDITABLE_PROFILE_FIELDS.join(", ")}`
    );
  }

  const { firstName, lastName, skills, about } = body;

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 50) {
      throw new Error("First name must be 2-50 characters");
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== "string" || lastName.trim().length < 2 || lastName.trim().length > 50) {
      throw new Error("Last name must be 2-50 characters");
    }
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every((s) => typeof s === "string")) {
      throw new Error("Skills must be an array of strings");
    }
    if (skills.length > 10) {
      throw new Error("Max 10 skills allowed");
    }
  }

  if (about !== undefined) {
    if (typeof about !== "string" || about.length > 500) {
      throw new Error("About must be a string of at most 500 characters");
    }
  }
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateEditProfileData,
};
