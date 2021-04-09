const passport = require("passport");
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

//TODO: set up https connection
