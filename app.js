// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

const express = require('express'),
    session = require('express-session'),
    app = express();

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

let port = 3000;
app.listen(3000, () => {
    console.log("Server is listening on port ", port);
});