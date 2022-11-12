const express = require('express');
const session = require("express-session");
require('./authentication/auth.js');

const app = express();

app.use(
    session({
        key: "user_sid",
        secret: "somerandonstuffs",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000,
        },
    })
);

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies


var redirectToLoginPage = (req, res, next) => {
    if (!req.user) {
        res.redirect("/");
    } else {
        next();
    }
};

app.get('/', (req, res) => {
    res.send('HomePage <br> <a href="/login">Login</a>');
});

app.use('/user', require('./route/user'));

app.get('/dashboard', redirectToLoginPage, (req, res) => {
    res.json(req.session.passport);
});

app.listen(8080, () => {
    console.log(`App is listening on port 8080`);
});