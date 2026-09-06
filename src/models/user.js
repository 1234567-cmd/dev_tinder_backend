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
        // Strength is validated on the raw password in the /signup route;
        // the stored value is a bcrypt hash, so no validator here.
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
    }, {
        timestamps: true,
        // Never serialize the password hash (or mongoose's __v) when a user
        // document is sent in a response via res.json / res.send.
        toJSON: {
            transform(doc, ret) {
                delete ret.password
                delete ret.__v
                return ret
            }
        }
    })



module.exports = mongoose.model("User", userSchema)