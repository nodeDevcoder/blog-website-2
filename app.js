// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

const express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    home = require('./routes/home'),
    auth = require('./routes/auth'),
    dashboard = require('./routes/dashboard'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    passportLocalMongoose = require('passport-local-mongoose'),
    LocalStrategy = require('passport-local/lib'),
    User = require('./models/user'),
    Blog = require('./models/blog'),
    Comment = require('./models/comment'),
    app = express();

mongoose.connect('mongodb://localhost:27017/bloggr', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));

app.use(session({
    name: 'session',
    secret: 'jibril',
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'user-cookie',
        maxAge: 1000 * 60 * 5,
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


app.use((req, res, next) => {
    res.locals.title = 'Bloggr'
    next();
});

app.use(home);
app.use(auth);
app.use(dashboard);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let port = 3000;
app.listen(3000, () => {
    console.log("Server is listening on port", port);
});