const req = require('express/lib/request'),
    User = require('../models/user'),
    express = require('express'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    router = express.Router({ mergeParams: true }),
    middleware = require('../middleware');


router.get('/login', middleware.notLoggedIn, async (req, res) => {
    res.render('login');
});

router.post('/login', middleware.notLoggedIn, passport.authenticate('local', { failureRedirect: '/login' }), async (req, res, next) => {
    res.redirect('/dashboard')
});

router.get('/signup', middleware.notLoggedIn, async (req, res, next) => {
    res.render('signup');
});

router.post('/signup', middleware.notLoggedIn, async (req, res, next) => {
    try {
        let { email, firstName, lastName, username, password, usertype } = req.body;
        firstName = middleware.capitalize(firstName);
        lastName = middleware.capitalize(lastName);
        const user = new User({ email, firstName, lastName, username, type: usertype });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return err;
            } else {
                res.redirect('/dashboard');
            }
        });
    } catch (err) {
        console.log("err", err)
        res.redirect('/signup')
    }
});

router.get('/logout', middleware.isLoggedIn, (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        else { res.redirect('/') }
    });
})

module.exports = router;