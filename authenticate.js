const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("./models/user");
const JWT = require("jsonwebtoken");
const config = require("./config");
const ObjectId = require("mongoose").Types.ObjectId;

//using passport authenticate
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (uid) => {
  return JWT.sign({ _id: uid }, config.key, { expiresIn: "2 days" });
};

exports.verifyUser = async (req, res, next) => {
  //check if auth bearer is exist
  if (!req.signedCookies.authorization) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  } else {
    //check if authHeader contain bearer or not
    let authBearer = req.signedCookies.authorization;
    if (!authBearer.startsWith("bearer ")) {
      res.status(403).json({
        message: "Authorization header not in correct form",
        success: false,
      });
    } else {
      try {
        let token = authBearer.split(" ")[1];
        //decoding token
        const decodedToken = JWT.verify(token, config.key);
        //check valid id
        if (ObjectId.isValid(decodedToken._id)) {
          const user = await User.findById(decodedToken._id);
          //if user found
          if (user) {
            req.user = { _id: user._id };
            next();
          } else {
            res.status(401).json({ success: false, message: "User not found" });
          }
        } else {
          res.status(403).json({ success: false, message: "Not a valid id" });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, err });
      }
    }
  }
};

exports.facebookPassport = passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: "https://localhost:3443/users/callback",
      profileFields: ["id", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      //get that user data from profile data
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          done(err, false);
        }
        //no err found
        else {
          //no user found
          if (user == null) {
            console.log(profile);
            //TODO: Ask user to enter a valid username
            user = new User({ username: profile.id, facebookId: profile.id });
            //check if email address is exist
            let emailAddress = "Not an valid email";
            if (profile.emails.length >= 1) {
              emailAddress = profile.emails[0].value;
            }
            user.email = emailAddress;
            user.save((err, user) => {
              if (err) {
                done(err, false);
              } else {
                done(null, user);
              }
            });
          }
          //found user with facebook id
          else {
            done(null, user);
          }
        }
      });
    }
  )
);

exports.googlePassport = passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: "https://localhost:3443/users/google/callback",
    },
    (request, accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) {
          done(err, false);
        }
        //no err found
        else {
          //no user found
          if (user == null) {
            console.log(profile);
            //TODO: Ask user to enter a valid username
            user = new User({ username: profile.id, googleId: profile.id });
            //check if email address is exist
            let emailAddress = "Not an valid email";
            if (profile.emails.length >= 1) {
              emailAddress = profile.emails[0].value;
            }
            user.email = emailAddress;
            user.save((err, user) => {
              if (err) {
                done(err, false);
              } else {
                done(null, user);
              }
            });
          }
          //found user with facebook id
          else {
            done(null, user);
          }
        }
      });
    }
  )
);

//TODO: fix callback link for facebook and google oauth
