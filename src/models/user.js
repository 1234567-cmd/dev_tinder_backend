const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
        required:true,
        maxLength:50
    },
    emailId: {
        type: String,
        required:true,
        unique:true,
        trim:true
    },
    password: {
        type: String,
        required:true,
    },
    age: {
        type: Number,
        min:18
    },
    gender: {
        type: String
    },
    photoUrl:{
        type:String,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Gender Value is not valid")
            }
        }

    },
    skills:{
        type:[String]
    },
    about:{
        type:String

    }
},{timestamps:true})



module.exports = mongoose.model("User", userSchema)