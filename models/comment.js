const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./user'),
    Blog = require('./blog');

let commentSchema = new mongoose.Schema({
    text: { type: String },
    level: { type: Number }
});

module.exports = mongoose.model("Comment", commentSchema)