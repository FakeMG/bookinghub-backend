const database = require('../database');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = '440715256432-13f5l15eqea1pk8i7575es8cpq84sdc4.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        let userProfileInDatabase = await database.GetUserFromEmail(profile.emails.at(0).value);
        return cb(null, userProfileInDatabase);
    }
));

// lưu vào req.session.passport
passport.serializeUser(function (user, done) {
    done(null, user);
});

// lưu vào req.user
passport.deserializeUser(function (user, done) {
    done(null, user);
});