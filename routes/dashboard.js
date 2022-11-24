const comment = require('../models/comment');
const user = require('../models/user');

const req = require('express/lib/request'),
    User = require('../models/user'),
    Blog = require('../models/blog'),
    Comment = require('../models/comment'),
    express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    router = express.Router({ mergeParams: true }),
    middleware = require('../middleware');


// router.get('/', middleware.isLoggedIn, async (req, res, next) => {
//     res.render('dashboard', { req });
// });

router.get('/blogs/new', middleware.isLoggedIn, async (req, res, next) => {
    let responsed = req.session.blogInfo || { title: '', description: '', content: '', tags: '' }
    res.render('createblog', { tinyMCE: true, responsed });
});

router.post('/blogs/new', middleware.isLoggedIn, async (req, res, next) => {
    let { title, description, content, tags } = req.body;
    // parse tags
    tags = tags.split(',')
    tags.forEach((tag, index) => {
        tags[index] = tags[index].trim().toLowercase();
    });
    tags = tags.filter((v, i, a) => a.indexOf(v) === i);

    const blog = new Blog({ author: req.user.id, title, description, content, tags });
    blog.save(async (err) => {
        if (err) {
            req.session.blogInfo = { title, description, content, tags: parsedTags }
            req.flash('error', "Oh no! We couldn't process that fully. Try again?")
            res.redirect('/blogs/new')
        } else {
            req.flash('success', "Yay! You successfully created a blog!")
            res.redirect('/blogs/drafts/view');
        }
    });
});

router.get('/blogs/drafts/view', middleware.isLoggedIn, async (req, res, next) => {
    // find all blogs from author that have state of draft
    let blogs = await Blog.find({ author: req.user._id, currentState: 'draft' });
    // render file with these blogs
    res.render('bloglist', { blogs });
});

router.get('/blogs/published/view', middleware.isLoggedIn, async (req, res, next) => {
    // find all blogs from author that have state of draft
    let blogs = await Blog.find({ author: req.user._id, currentState: 'published' });
    // render file with these blogs
    res.render('bloglist', { blogs });
});

router.get('/blogs/:id/view', async (req, res, next) => {
    const blog = await Blog.findOne({ _id: req.params.id, currentState: 'published' }).populate('author');
    if (blog) {
        let comments = await Comment.find({ blog: blog._id }).sort('-createdAt').populate('user');
        if (req.isAuthenticated()) {
            if (req.user.username !== blog.author.username) {
                let rec = req.user.recentlyViewed.map(x => x)
                let lastFive = rec.slice(-5)
                console.log(lastFive.some(ele => ele.equals(blog._id)))
                if (!lastFive.some(ele => ele.equals(blog._id))) {
                    req.user.recentlyViewed.push(blog._id)
                    req.user.save()
                    blog.views++
                    await blog.save()
                }
            }
            let liked = req.user.reader.likedBlogs.includes(blog._id)
            res.render('viewblog', { blog, comments, liked })
        } else {
            res.render('viewblog', { blog, comments, liked: false })
        }
    } else {
        req.flash("error", "Blog could not be found")
        res.redirect('/');
    }
});

router.get('/blogs/drafts/:id/edit', middleware.isLoggedIn, async (req, res, next) => {
    // find blog using id
    Blog.findOne({ author: req.user._id, _id: req.params.id, currentState: 'draft' }, (err, blog) => {
        if (!blog) {
            req.flash('error', "Blog could not be found")
            res.redirect('/')
        } else {
            res.render('editblog', { blog, tinyMCE: true, p: false });
        }
    });
});

router.post('/blogs/drafts/:id/edit', middleware.isLoggedIn, async (req, res, next) => {
    let { title, description, content, tags } = req.body;
    tags = tags.split(',')
    tags.forEach((tag, index) => {
        tags[index] = tags[index].trim().toLowercase();
    });
    tags = tags.filter((v, i, a) => a.indexOf(v) === i)
    Blog.findOneAndUpdate({ _id: req.params.id, currentState: 'draft', author: req.user }, { title, description, content, tags })
        .catch(err => {
            req.flash('error', "An error occurred. Please try again")
            res.redirect('/blogs/drafts/view')
        }).then(() => {
            req.flash('success', "Blog successfully updated!")
            res.redirect('/blogs/drafts/view');
        })
});

router.get('/blogs/drafts/:id/review', middleware.isLoggedIn, async (req, res, next) => {
    // find blog using id
    Blog.findOne({ author: req.user._id, _id: req.params.id, currentState: 'draft' }, async (err, blog) => {
        if (!blog) {
            req.flash('error', "Blog could not be found")
            res.redirect('/blogs/drafts/view');
        } else {
            await blog.populate('author')
            res.render('reviewblog', { blog, tinyMCE: true });
        }
    });
});

router.get('/blogs/drafts/:id/publish', middleware.isLoggedIn, async (req, res, next) => {
    Blog.findOneAndUpdate({ author: req.user._id, _id: req.params.id, currentState: 'draft' }, { currentState: 'published' })
        .catch(() => {
            req.flash('error', 'Blog could not be published')
            res.redirect('/blogs/drafts/view');
        })
        .then(() => {
            req.flash('success', 'Blog successfully published!')
            res.redirect('/blogs/published/view');
        })
});

router.get('/blogs/published/:id/edit', middleware.isLoggedIn, async (req, res, next) => {
    // find blog using id
    Blog.findOne({ author: req.user._id, _id: req.params.id, currentState: 'published' }, (err, blog) => {
        if (!blog) {
            req.flash('error', "Blog could not be found")
            res.redirect('/')
        } else {
            res.render('editblog', { blog, tinyMCE: true, p: true });
        }
    });
});

router.post('/blogs/published/:id/edit', middleware.isLoggedIn, async (req, res, next) => {
    let { title, description, content, tags } = req.body;
    tags = tags.split(',')
    tags.forEach((tag, index) => {
        tags[index] = tags[index].trim().toLowercase();
    });
    tags = tags.filter((v, i, a) => a.indexOf(v) === i)
    Blog.findOneAndUpdate({ _id: req.params.id, currentState: 'published' }, { title, description, content, tags })
        .catch(err => {
            req.flash('error', "An error occurred. Please try again")
            res.redirect('/blogs/published/view')
        }).then(() => {
            req.flash('success', "Blog successfully updated!")
            res.redirect(`/blogs/${req.params.id}/view`);
        })
});

router.get('/blogs/published/:id/revert', middleware.isLoggedIn, async (req, res, next) => {
    let blog = await Blog.findOne({ author: req.user._id, currentState: 'published' });
    if (blog) {
        blog.currentState = 'draft';
        await blog.save();
        req.flash('success', "You reverted your blog to a draft!")
        res.redirect('/blogs/drafts/view')
    } else {
        req.flash('error', "We're sorry, we couldn't find your blog. Please try again")
        res.redirect('/blogs/published/view')
    }
});

router.post('/blogs/:id/like', middleware.isLoggedIn, async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).catch(err => console.log(err));
    if (blog) {
        // if user.likedblogs contains this blog
        if (req.user.reader.likedBlogs.includes(blog._id)) {
            let index = req.user.reader.likedBlogs.indexOf(blog._id);
            req.user.reader.likedBlogs.splice(index, 1);
            await req.user.save()
            index = blog.likes.indexOf(req.user._id)
            blog.likes.splice(index, 1)
            await blog.save();
            res.status(200).json({ liked: false })
        } else {
            req.user.reader.likedBlogs.push(blog._id);
            await req.user.save();
            blog.likes.push(req.user._id)
            await blog.save()
            res.status(200).json({ liked: true })
        }
    } else {
        res.status(404)
    }
});

router.post('/blogs/:id/comment', middleware.isLoggedIn, async (req, res, next) => {
    if (req.body.comment.trim() !== '') {
        Blog.findById(req.params.id).then(async blog => {
            if (blog) {
                let comment = await Comment.create({
                    text: req.body.comment,
                    blog: blog._id,
                    user: req.user._id
                });
                res.json({ success: true, text: comment.text, username: req.user.username, id: req.user.id,  time: comment.createdAt, profile: req.user.profile.path.replace('/upload', '/upload/w_200') })
            } else {
                console.log("Blog not found while creating comment")
            }
        })
    }
});

router.get('/search', middleware.isLoggedIn, async (req, res, next) => {
    if (req.query.q) {
        const regex = new RegExp(middleware.escapeRegex(req.query.q), 'gi');
        let users = await User.find({ $or: [{ 'firstName': regex }, { 'lastName': regex }, { 'username': regex }] }).catch(err => console.log(err));
        let blogs = await Blog.find({ $and: [{ $or: [{ 'title': regex }, { 'description': regex }, { 'content': regex }] }, { currentState: 'published' }] }).populate('author').catch(err => console.log(err));
        res.render('results', { users, blogs, req })
    } else {
        res.redirect('back')
    }
});


module.exports = router;