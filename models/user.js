const mongoose = require("mongoose"),
    Blog = require('./blog'),
    passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    type: { type: String, enum: ['reader', 'author'], required: true },
    author: {
        blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }]
    },
    reader: {
        likedBlogs: [{ type: mongoose.Schema.Types.ObjectId }]
    },
    password: String
})

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'] });

module.exports = mongoose.model("User", userSchema)