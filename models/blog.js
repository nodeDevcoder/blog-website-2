const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose'),
    User = require('./user'),
    Comment = require('./comment');


let blogSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    content: { type: String, required: true, unique: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: [],
    currentState: { type: String, enum: ['draft', 'published'], required: true, default: 'draft' }
});

module.exports = mongoose.model("Blog", blogSchema);