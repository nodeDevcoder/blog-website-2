const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./user'),
    Blog = require('./blog');

let commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    level: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema)