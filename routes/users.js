const express = require("express");
const passport = require("passport");
const usersRouter = express.Router();
const User = require("../models/user");
const authenticate = require("../authenticate");

//Test signup route

usersRouter.post("/signup", async (req, res, next) => {
  try {
    const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const emailRegEx = /\S+@\S+\.\S+/;
    //check if password pass requirement: Minimum eight characters, at least one letter and one number
    if (!req.body.email.match(emailRegEx)) {
      let err = "EmailRequirementNotMet: l";
      throw err;
    }
    if (!req.body.password.match(passwordRegEx)) {
      let err = "PasswordRequirementNotMet: l";
      throw err;
    }
    const user = await User.register(
      new User({ username: req.body.username, email: req.body.email }),
      req.body.password
    );
    res.status(200).json({ message: "Signup successfully" });
  } catch (err) {
    //err code :
    //UserExistsError
    //MissingUsernameError
    //MissingPasswordError
    //RequirementNotMet
    // extract error code
    let code = err.toString().split(":")[0];
    switch (code) {
      case "UserExistsError":
        res.status(500).json({
          error: "A user with the given username is already registered",
        });
        break;
      case "MissingUsernameError":
        res.status(500).json({ error: "No username was given" });
        break;
      // case "MissingPasswordError":
      //   res.status(500).json({ error: "No password was given" });
      //   break;
      case "PasswordRequirementNotMet":
        res.status(500).json({
          error:
            "Password has to have minimum eight characters, at least one letter and one number",
        });
        break;
      case "EmailRequirementNotMet":
        res.status(500).json({ error: "Email not in correct form" });
        break;
    }
    next(err);
  }
});

usersRouter.post("/login", (req, res, next) => {
  //check if username or password is empty
  if (req.body.password === "" || req.body.username === "") {
    res.status(400).json({ error: "Username or password is empty" });
  } else {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      if (!user) {
        res
          .status(401)
          .json({ error: "Wrong credentials, please try again", err: info });
      } else {
        req.login(user, (err) => {
          if (!err) {
            const token = authenticate.getToken(user._id);
            res.status(200).json({ message: "Log in successfully", token });
          } else {
            console.error(err);
            res.status(500).json({ error: err });
          }
        });
      }
    })(req, res, next);
  }
});

module.exports = usersRouter;
