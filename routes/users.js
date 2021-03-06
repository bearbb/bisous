const express = require("express");
const passport = require("passport");
const usersRouter = express.Router();
const User = require("../models/user");
const Image = require("../models/image");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");
const Follow = require("../models/follow");
const { response } = require("express");
const verify = require("../verify");
const cookieOptions = {
  signed: true,
  domain: "application.swanoogie.me",
  //TODO: enable secure for ssl connection
  secure: true,
  httpOnly: true,
  sameSite: "none",
};

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
      new User({
        username: req.body.username,
        email: req.body.email,
        posts: [],
      }),
      req.body.password
    );
    //create new favorite and follow doc
    const favorite = new Favorite({ author: user._id });
    const follow = new Follow({ author: user._id });
    await Promise.all([favorite.save(), follow.save()]);
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
            /*            res.cookie("authorization", `bearer ${token}`, {
              signed: true,
		    domain: "application.swanoogie.me",
              //TODO: enable secure for ssl connection
              secure: true,
             httpOnly: true,
            }); */
            res.cookie("authorization", `bearer ${token}`, cookieOptions);
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
usersRouter.get("/logout", authenticate.verifyUser, async (req, res) => {
  try {
    /*    res.clearCookie("authorization", {signed: true, secure: true, domain:"application.swanoogie.me" , httpOnly:true, sameSite:"None"}); */
    res.clearCookie("authorization", cookieOptions);
    res.status(200).json({ success: true, message: "Logout successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong please try again",
      success: false,
    });
  }
});

usersRouter.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
usersRouter.get(
  "/callback",
  passport.authenticate("facebook", {
    scope: ["email"],
    failureRedirect: "/failure",
  }),
  (req, res, next) => {
    if (req.user) {
      //return an cookie
      let token = authenticate.getToken(req.user._id);
      res.cookie("authorization", `bearer ${token}`, {
        signed: true,
        secure: true,
        httpOnly: true,
        sameSite: "None",
        //TODO: set expires for this cookie
        // expires: xxx
      });
      res.status(200).json({
        success: true,
        message: "Login through facebook successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  }
);
usersRouter.get("/failure", (req, res) => {
  res.status(200).json({ success: false, message: "Login unsuccessfully" });
});

//TODO: OAuth using google

usersRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email"] })
);
usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    scope: ["email"],
    failureRedirect: "/failure",
  }),
  (req, res, next) => {
    if (req.user) {
      //return an cookie
      let token = authenticate.getToken(req.user._id);
      res.cookie("authorization", `bearer ${token}`, {
        signed: true,
        secure: true,
        httpOnly: true,
        //TODO: set expires for this cookie
        // expires: xxx
      });
      res.status(200).json({
        success: true,
        message: "Login through google successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  }
);

usersRouter.route("/").get(authenticate.verifyUser, async (req, res) => {
  //return user data
  try {
    let userDoc = await User.findById(req.user._id).lean();
    res.status(200).json({
      success: true,
      username: userDoc.username,
      userId: userDoc._id,
      postCount: userDoc.postCount,
      avatar: userDoc.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong please try again",
    });
  }
});

usersRouter
  .route("/:userId/posts")
  .get(authenticate.verifyUser, async (req, res) => {
    //return posts array contain all postId by this user
    try {
      let userDoc = await User.findById(req.params.userId).lean();
      if (userDoc) {
        res.status(200).json({
          success: true,
          posts: userDoc.posts,
          postCount: userDoc.postCount,
        });
      }
    } catch (er) {
      console.error(er);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  });

usersRouter
  .route("/:userId")
  .get(authenticate.verifyUser, verify.verifyUserId, async (req, res) => {
    //return username and user description
    try {
      let userDoc = await User.findById(req.params.userId).lean();
      if (userDoc) {
        res.status(200).json({
          success: true,
          userDoc: {
            username: userDoc.username,
            avatar: userDoc.avatar,
            bio: userDoc.description,
          },
        });
      } else {
        res.status(403).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, pls try again",
      });
    }
  });
usersRouter.route("/avatar").post(authenticate.verifyUser, async (req, res) => {
  try {
    //check if image doc existed
    let imageDoc = await Image.findById(req.body.imageId).exec();
    if (imageDoc) {
      //get user doc
      let userDoc = await User.findById(req.user._id).exec();
      //update user avatar with new image id
      //TODO: remove old image doc
      userDoc.avatar = req.body.imageId;
      userDoc = await userDoc.save();
      res
        .status(200)
        .json({ success: true, message: "Change avatar successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid image id" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong, pls try again", success: false });
  }
});
usersRouter
  .route("/bio")
  .get(authenticate.verifyUser, async (req, res) => {
    try {
      let userDoc = await User.findById(req.user._id).lean();
      res.status(200).json({ success: true, bio: userDoc.description });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, pls try again",
      });
    }
  })
  .post(authenticate.verifyUser, async (req, res) => {
    try {
      let userDoc = await User.findById(req.user._id).exec();
      userDoc.description = req.body.bio.toString();
      userDoc = await userDoc.save();
      res.status(200).json({ success: true, userDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, pls try again",
      });
    }
  });
module.exports = usersRouter;
