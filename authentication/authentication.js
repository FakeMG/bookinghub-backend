const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const passport = require('passport');
// const database = require('../database');
require('./auth.js');

//login rồi thì không được truy cập
var redirectToHomePageIfAlreadyLoggedIn = (req, res, next) => {
    if (req.session.passport && req.session.passport.user) {
        res.redirect("/");
    } else {
        next();
    }
};

router.use(passport.initialize());
router.use(passport.session());

router.use(cookieParser());

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
router.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.passport) {
        console.log("clear cookies");
        res.clearCookie("user_sid");
    }
    next();
});

router.route('/login')
    .get(redirectToHomePageIfAlreadyLoggedIn, (req, res) => {
        res.send('<a href="/auth/google">Login with google</a>');
    })
// .post(async (req, res) => {
//     // get user data from req.body
//     const { email, password } = req.body;

//     // verify user data
//     let results = await database.GetUserFromEmail(email);
//     if (!results || !(await database.checkPassword(results, password))) {
//         console.log('Email or password is incorrect');
//         res.status(401).jsonp({ message: "Your email or password is incorrect" });
//         return;
//     }

//     // save user's data in session memory
//     const user = { user_id: results[0].owner_id, user_email: email, user_name: results[0].username };
//     req.session.passport = { user };

//     // send session data to client
//     res.status(200).jsonp({ message: "Logged in", user });
//     return;
// })

router.route('/logout')
    .get((req, res) => {
        if (req.session.passport && req.cookies.user_sid) {
            // console.log("Goodbye " + req.session.passport.user[0].username);

            res.clearCookie("user_sid");
            res.status(200).jsonp("Logged out");
            // res.redirect("/");
        } else {
            res.status(401).redirect("/login");
        }
    })

router.route('/register')
    .get(redirectToHomePageIfAlreadyLoggedIn, (req, res) => {
        res.send('this account is not registered');
    })
// .post(async (req, res) => {
//     // get user data from req.body
//     const { email, password, phone_number, user_name } = req.body;
//     const users = [email, phone_number, user_name, password];

//     // verify user data
//     let results = await database.GetUserFromEmail(email);
//     if (results) {
//         res.status(401).jsonp("Email has already existed");
//         return;
//     }

//     // save user's data in session memory
//     const user = { user_id: await database.createAccount(users), user_email: email, user_name: user_name };
//     req.session.passport = { user };

//     // send session data to client
//     res.status(201).jsonp({ message: "Registerd", user });
//     return;
// })

//======================================= Google Auth
router.route('/auth/google')
    .get(redirectToHomePageIfAlreadyLoggedIn,
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

router.route('/auth/google/callback')
    .get(redirectToHomePageIfAlreadyLoggedIn,
        passport.authenticate('google', { failureRedirect: '/register' }),
        function (req, res) {
            res.status(200).jsonp(req.session.passport.user);
        }
    );

module.exports = router;