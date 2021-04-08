const passport = require("passport");
const User = require("./models/user");
const JWT = require("jsonwebtoken");
const config = require("./config");

//using passport authenticate
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (uid) => {
  return JWT.sign({ _id: uid }, config.key, { expiresIn: "2 days" });
};
