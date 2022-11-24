const express = require('express'),
    User = require('../models/user'),
    Blog = require('../models/blog'),
    mongoose = require('mongoose'),
    router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
    let popular = await Blog.find({ published: true }).populate('author').sort({ views: '-1' }).limit(6);
    if (req.isAuthenticated()) {
        let suggested = await User.findOne({ username: req.user.username }).populate('recentlyViewed')
        let blogs = await Blog.find({ author: req.user.reader.following, currentState: 'published' }).populate('author').sort({ createdOn: 'desc' }).limit(5);
        res.render('home', { title: "Bloggr Website", user: req.user ? true : false, popular, blogs });
    } else {
        res.render('home', { title: "Bloggr Website", user: req.user ? true : false, popular });
    }
});


module.exports = router;