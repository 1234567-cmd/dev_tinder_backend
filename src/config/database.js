const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://engineerwaseemahmad_db_user:IyNzVXZllwu6fa8S@namastenodejs.hndwppr.mongodb.net/devTinder")
}

module.exports = connectDB;
