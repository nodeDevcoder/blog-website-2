if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    home = require('./routes/home'),
    auth = require('./routes/auth'),
    users = require('./routes/users'),
    dashboard = require('./routes/dashboard'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    LocalStrategy = require('passport-local/lib'),
    User = require('./models/user'),
    Blog = require('./models/blog'),
    Comment = require('./models/comment'),
    mongoSanitize = require('express-mongo-sanitize'),
    nodemon = require('nodemon'),
    flash = require('connect-flash'),
    dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/bloggr',
    // { MongoStore } = require('connect-mongo'),
    MongoDBStore = require('connect-mongo')(session),
    app = express();

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));

app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600
});

store.on("error", (e) => {
    console.log('Session Store Error', e)
})

app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'user-cookie',
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
        signed: true
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.title = 'BlogSpot';
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.success = req.flash('success');
    next();
});

mongoose.set('sanitizeFilter', true);

app.use(bodyParser.json())

app.use(home);
app.use(auth);
app.use(dashboard);
app.use(users);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is listening on port", port);
});