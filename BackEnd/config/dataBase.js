const mongoose = require("mongoose");
require("dotenv").config();

exports.dataBaseConnect = async ()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("DB connection Successful")
    } catch (error) {
        console.log("DB connection Failed")
        console.log(error);
        process.exit();
    }
        
}