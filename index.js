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

app.use(require('./authentication/authentication'));

app.get('/dashboard', redirectToLoginPage, (req, res) => {
    res.json(req.session.passport);
});

var port_number = server.listen(process.env.PORT || 3000);
app.listen(port_number, () => {
    console.log(`App is listening on port 8080`);
});