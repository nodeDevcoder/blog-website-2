const req = require('express/lib/request'),
    User = require('../models/user'),
    Blog = require('../models/blog'),
    express = require('express'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    router = express.Router({ mergeParams: true }),
    middleware = require('../middleware');

router.get('/dashboard', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    } else {
        res.render('dashboard', { req })
    }
});

// When get request to /blogs/new, ensure is author account - send new blog

router.get('/blogs/new', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    let blog = await new Blog({
        title: "Hello3",
        text: "Hello world"
    });

    console.log(req.user)
    blog.save(async (err) => {
        if (!err) {
            let user = await User.findById(req.user._id)
            console.log(user)
            console.log(blog._id);
            await user.author.blogs.push(blog._id)
            await user.save();
            // user.populate('a')
            res.send(req.user);
        } else {
            console.log(err);
        }
    });

    // res.render('createBlog');
});

// When get request to /blogs/view, ensure is author account - list all blogs

router.get('/blogs/view', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    let user = await User.findById(req.user._id).populate('author.blogs');
    res.send(user)
});


module.exports = router;