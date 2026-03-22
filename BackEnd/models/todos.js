const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true,
            maxlength :50
        },
        description : {
            type : String,
        },
        completed :{
            type : Boolean,
            default : false
        },
        priority : {
            type :String,
            enum : ["low","mid","high"],
            default: "mid"
        },
        dueDate :{
            type: Date,
        }
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model("Todo",todoSchema);