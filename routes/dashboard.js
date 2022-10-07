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
        res.render('dashboard', { req });
    }
});

router.get('/blogs/new', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    // When get request to /blogs/new, ensure is author account - send new blog form
    res.render('createblog', { tinyMCE: true });
});

router.post('/blogs/new', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    let { title, description, content } = req.body;
    // create new Blog
    const blog = new Blog({ author: req.user._id, title, description, content });
    blog.save(async (err) => {
        let user = req.user;
        user.author.blogs.push(blog._id);
        await user.save();
        res.redirect('/dashboard');
    });
});

router.get('/blogs/drafts/view', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    // find all blogs from author that have state of draft
    let blogs = await Blog.find({ author: req.user._id, currentState: 'draft' });
    // render file with these blogs
    res.render('bloglist', { blogs });
});

router.get('/blogs/published/view', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    // find all blogs from author that have state of draft
    let blogs = await Blog.find({ author: req.user._id, currentState: 'published' });
    // render file with these blogs
    res.render('bloglist', { blogs });
});

router.get('/blogs/drafts/:id/edit', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {
    // find blog using id
    await Blog.find({ author: req.user._id, _id: req.params.id }, (err, blog) => {
        if (!blog) {
            res.send('Blog could not be found');
        } else {
            res.render('editblog', { blog });   
        }
    });
});

router.get('/blogs/drafts/review', middleware.isLoggedIn, middleware.isAuthor, async (req, res, next) => {

});
 

module.exports = router;