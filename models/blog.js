const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./user'),
    Comment = require('./comment');


let blogSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Blog", blogSchema);