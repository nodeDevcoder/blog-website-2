const mongoose = require("mongoose"),
    Blog = require('./blog'),
    Comment = require('./comment'),
    passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profile: {
        path: { type: String, required: true, default: 'https://res.cloudinary.com/dcjeqcrq0/image/upload/v1668892435/Blogging/placeholder-person_wodh1z.jpg' },
        name: { type: String, required: true, default: 'Blogging/placeholder-person_wodh1z.jpg' }
    }, 
    author: {
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    reader: {
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        likedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }]
    },
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    password: String
})

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'] });

module.exports = mongoose.model("User", userSchema)