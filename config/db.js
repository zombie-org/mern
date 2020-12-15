//                          DBName:DBpaswrd
//"mongoURI": mongodb+srv://MernDB:MernDB@merntut.vtjkl.mongodb.net/<dbname>?retryWrites=true&w=majority
const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
    });

    console.log("DB Connected");
  } catch (err) {
    console.error(err.message);
    //error occured exit process
    process.exit(1);
  }
};
module.exports = connectDB;
