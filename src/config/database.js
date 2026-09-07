const mongoose = require('mongoose');

const DB_URI = "mongodb://engineerwaseemahmad_db_user:IyNzVXZllwu6fa8S@ac-zkm68vw-shard-00-00.hndwppr.mongodb.net:27017,ac-zkm68vw-shard-00-01.hndwppr.mongodb.net:27017,ac-zkm68vw-shard-00-02.hndwppr.mongodb.net:27017/devTinder?ssl=true&replicaSet=atlas-qssa4h-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectDB = async () => {
    await mongoose.connect(DB_URI);
}

module.exports = connectDB;
