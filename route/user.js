const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const passport = require('passport');
const database = require('../database');
require('../authentication/auth.js');

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
    .post(async (req, res) => {
        // get user data from req.body
        const { email, password } = req.body;

        // verify user data
        let results = await database.GetUserFromEmail(email);
        if (!results || !(await database.checkPassword(results, password))) {
            res.status(401).jsonp({ message: "Your email or password is incorrect" });
            return;
        }

        // save user's data in session memory
        const user = { user_id: results[0].user_id, user_email: email, firstName: results[0].first_name, lastName: results[0].last_name, isOwner: results[0].is_owner };
        req.session.passport = { user };

        // send session data to client
        res.status(200).jsonp({ message: "Logged in", user });
        return;
    })

router.route('/logout')
    .get((req, res) => {
        if (req.session.passport && req.cookies.user_sid) {
            res.clearCookie("user_sid");
            res.status(200).jsonp({ message: "Logged out" });
        } else {
            res.status(401).redirect("/login");
        }
    })

router.route('/register')
    .get(redirectToHomePageIfAlreadyLoggedIn, (req, res) => {
        res.send('this account is not registered');
    })
    .post(async (req, res) => {
        // get user data from req.body
        const { email, password, firstName, lastName, dob, gender, phone_number, isOwner } = req.body;
        const users = [email, password, firstName, lastName, dob, GetCurrentDate(), gender, phone_number, isOwner];

        try {
            // verify user email
            let results = await database.GetUserFromEmail(email);
            if (results) {
                res.status(401).jsonp({ message: "Email has already existed" });
                return;
            }

            // save user's data in session memory
            const user = { user_id: await database.createAccount(users), user_email: email, firstName: firstName, lastName: lastName, isOwner: isOwner };
            req.session.passport = { user };

            // send session data to client
            res.status(201).jsonp({ message: "User registered", user });
            return;
        }
        catch (err) {
            res.status(401).jsonp({ err });
            return;
        }
    })

function GetCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

router.route('/:id')
    .delete(async (req, res) => {
        try {
            // get user data from req.body
            const { id } = req.params;

            // verify user email
            let results = await database.GetUserFromID(id);
            if (!results) {
                res.status(401).jsonp({ message: "User doesn't exist" });
                return;
            }

            await database.deleteAccount(id);

            // send session data to client
            res.status(200).jsonp({ message: "User deleted" });
            return;
        }
        catch (err) {
            res.status(401).jsonp({ err });
            return;
        }
    })

router.route('/')
    .get(async (req, res) => {
        try {
            let results = await database.GetUser(req.query);
            if (!results) {
                res.status(401).jsonp({ message: "No results found" });
                return;
            }

            res.status(200).jsonp({ results });
            return;
        }
        catch (err) {
            res.status(401).jsonp({ err });
            return;
        }
    })


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