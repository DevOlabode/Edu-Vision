const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String
    },
    fileName : {
        type : String,
        required : true
    },
    summary :{
        type : String,
        required : true
    },
    fileType : {
        type : String,
        enum : ['pdf', 'doc', 'docx', 'txt'],
        required : true
    },
    fileSize : Number,
    cloudinaryId : String,
    status : {
        type : String,
        enum : ['processing', 'ready', 'error'],
        default : 'processing'
    },
    uploadedBy : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
}, {timestamps : true});

module.exports = mongoose.model('Material', materialSchema);