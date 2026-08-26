const mongoose = require("mongoose")
const validator = require("validator")
const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Password is weak");
            }
        },

        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            validate(value) {
                if (!["male", "female", "other"].includes(value)) {
                    throw new Error("Gender Value is not valid")
                }
            },
        },
        photoUrl: {
            type: String,

            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid URL address: " + value)
                }
            }

        },
        skills: {
            type: [String]
        },
        about: {
            type: String

        }
    }, { timestamps: true })



module.exports = mongoose.model("User", userSchema)