const req = require('express/lib/request'),
    User = require('../models/user'),
    Blog = require('../models/blog'),
    express = require('express'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    router = express.Router({ mergeParams: true }),
    multer = require('multer'),
    { cloudinary } = require('../cloudinary'),
    { storage } = require('../cloudinary'),
    upload = multer({ storage }),
    middleware = require('../middleware');

router.get('/users/:id/', middleware.isLoggedIn, async (req, res, next) => {
    let userId = req.params.id
    // find user with _id
    User.findById(userId, async (err, user) => {
        if (err) {
            console.log(err);
        } else if (user) {
            await user.populate({ path: 'author', populate: 'followers' });
            let blogs = await Blog.find({ author: user, currentState: 'published' }).limit(5)
            if (req.user.email == user.email) { // if the user is viewing their own profile
                res.redirect('/profile')
            } else {
                const following = req.user.reader.following.includes(user._id)
                res.render('profile', { user, blogs, edit: false, following })
            }
        } else {
            req.flash('error', "User could not be found")
            res.redirect('/')
        }
    });
});

router.get('/profile', middleware.isLoggedIn, async (req, res, next) => {
    let user = await User.findById(req.user._id).populate([{ path: 'author.followers', options: { limit: 10 } }, { path: 'reader.following reader.likedBlogs', options: { limit: 10 } }])
    console.log(user)
    let blogs = await Blog.find({ author: user, currentState: 'published' })
    res.render('profile', { edit: true, user, blogs })
});

router.post('/profile/upload', middleware.isLoggedIn, upload.single('pfp'), async (req, res, next) => {
    let user = await User.findById(req.user._id);
    if (user.profile.name !== 'Blogging/placeholder-person_wodh1z.jpg') { // been changed
        cloudinary.uploader.destroy(user.profile.name);
    }
    user.profile = {
        path: req.file.path,
        name: req.file.filename
    }
    await user.save();
    res.json(user.profile.path)
});

router.post('/profile/remove', middleware.isLoggedIn, async (req, res, next) => {
    let user = await User.findById(req.user._id);
    if (user.profile.name !== 'Blogging/placeholder-person_wodh1z.jpg') { // been changed
        cloudinary.uploader.destroy(user.profile.name);
    }
    user.profile = {
        path: 'https://res.cloudinary.com/dcjeqcrq0/image/upload/v1668892435/Blogging/placeholder-person_wodh1z.jpg',
        name: 'Blogging/placeholder-person_wodh1z.jpg'
    }
    await user.save()
    res.json(user.profile.path)
});

router.post('/profile/following', middleware.isLoggedIn, async (req, res, next) => {
    if (req.body.params.lfq || req.body.params.lfq === 0) {
        let following = await User.find({ _id: req.user.reader.following }).skip(Number(req.body.params.lfq)).limit(7);
        if (req.user.reader.following.length > Number(req.body.params.lfq)) {
            let data = []
            for (user of following) {
                let obj = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    id: user.id,
                    profile: user.profile.path.replace('/upload', '/upload/w_100')
                }
                data.push(obj)
            }
            res.send({ data, exhausted: false })
        } else {
            res.send({ exhausted: true })
        }
    }
});

router.post('/profile/followers', middleware.isLoggedIn, async (req, res, next) => {
    if (req.body.params.lfwq || req.body.params.lfwq === 0) {
        let followers = await User.find({ _id: req.user.author.followers }).skip(Number(req.body.params.lfwq)).limit(7);
        if (req.user.author.followers.length > Number(req.body.params.lfwq)) {
            let data = []
            for (user of followers) {
                let obj = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    id: user.id,
                    profile: user.profile.path.replace('/upload', '/upload/w_100')
                }
                data.push(obj)
            }
            res.send({ data, exhausted: false })
        } else {
            res.send({ exhausted: true })
        }
    }
});

router.post('/users/:id/follow', middleware.isLoggedIn, async (req, res, next) => {
    let currentUser = req.user;
    let userId = req.params.id
    User.findById(userId, async (err, user) => {
        if (err) {
            console.log(err)
        } else if (user.email === currentUser.email) {
            console.log('equal to each other')
            res.redirect('/')
        } else {
            const following = currentUser.reader.following
            const followers = user.author.followers
            if (!following.includes(user._id) && !followers.includes(currentUser._id)) {
                console.log("following")
                await following.push(user._id);
                await currentUser.save();
                await followers.push(currentUser._id)
                await user.save()
            } else {
                let index = following.indexOf(user._id)
                if (index > -1) {
                    following.splice(index, 1)
                    await currentUser.save();
                    index = followers.indexOf(currentUser._id)
                    followers.splice(index, 1)
                    await user.save()
                } else {
                    console.log("ERROR")
                }
            }
            let blogs = await Blog.find({ author: user._id, currentState: 'published' })
            let data = {
                followers: followers.length,
                blogs: blogs.length,
                isFollowing: currentUser.reader.following.includes(user._id)
            }
            return res.json(data)
        }
    })
});

module.exports = router;