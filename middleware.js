

module.exports.capitalize = (word) => {
    if (typeof word !== 'string') return word
    return word.charAt(0).toUpperCase() + word.slice(1)
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next();
}

module.exports.notLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }
    next();
};

module.exports.isAuthor = (req, res, next) => {
    if (req.user.type !== "author") {
        return res.redirect('/dashboard');
    }
    next();
};

module.exports.isReader = (req, res, next) => {
    if (req.user.type !== "reader") {
        return res.redirect("/dashboard")
    }
    next();
};