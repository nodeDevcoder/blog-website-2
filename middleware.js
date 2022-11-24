

module.exports.capitalize = (word) => {
    if (typeof word !== 'string') return word
    return word.charAt(0).toUpperCase() + word.slice(1)
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl
        req.flash("error", "Please sign in first")
        return res.redirect('/login')
    }
    next();
}

module.exports.notLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next();
};

module.exports.escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}