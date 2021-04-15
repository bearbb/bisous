const express = require("express");
const Follow = require("../models/follow");
const User = require("../models/user");
const authenticate = require("../authenticate");
const utility = require("../utility");
const verify = require("../verify");

const followRouter = express.Router();

followRouter
  .route("/")
  //get all follower and following of this user
  .get(authenticate.verifyUser, async (req, res) => {
    try {
      let followDoc = await Follow.findOne({ author: req.user._id }).exec();
      if (followDoc) {
        //populate followDoc be4 return
        followDoc = await followDoc
          .populate({ path: "following", select: ["username", "email"] })
          .populate({ path: "follower", select: ["username", "email"] })
          .execPopulate();
        res.status(200).json({ success: true, followDoc });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .post((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support POST operation" });
  })
  .put((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support PUT operation" });
  })
  .delete((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support DELETE operation" });
  });

followRouter
  .route("/:userId")
  .get((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support GET operation" });
  })
  .post(authenticate.verifyUser, verify.verifyUserId, async (req, res) => {
    try {
      //check if that user is the same user that send request
      if (`${req.user._id}` === `${req.params.userId}`) {
        return res
          .status(403)
          .json({ success: false, message: "You can't follow yourself" });
      }
      //check if user with userId exist
      let userDoc = await User.findById(req.params.userId).lean();
      if (userDoc) {
        //get followDoc
        //get the one getting follow doc
        let [followDoc, beingFollowedDoc] = await Promise.all([
          Follow.findOne({ author: req.user._id }).exec(),
          Follow.findOne({
            author: req.params.userId,
          }).exec(),
        ]);
        //check if the userId is exists in following list and that one being follow follower list
        let followingIndex = followDoc.following.findIndex(
          (userId) => `${userId}` === `${req.params.userId}`
        );
        let beingFollowedIndex = beingFollowedDoc.follower.findIndex(
          (userId) => `${userId}` === `${req.user._id}`
        );
        //not exists
        if (!(followingIndex !== -1) && !(beingFollowedIndex !== -1)) {
          beingFollowedDoc.follower.unshift(req.user._id);
          //update follower count
          // beingFollowedDoc.followerCount = beingFollowedDoc.follower.length;
          followDoc.following.unshift(req.params.userId);
          //update following count
          // followDoc.followingCount = followDoc.following.length;
          //save both in parallel
          await Promise.all([followDoc.save(), beingFollowedDoc.save()]);
          res
            .status(200)
            .json({ success: true, message: "Follow successfully", followDoc });
        } else {
          res.status(403).json({
            success: false,
            message: "You are already followed this user",
          });
        }
      } else {
        res.status(403).json({ success: false, message: "User not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .put((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support PUT operation" });
  })
  .delete(authenticate.verifyUser, verify.verifyUserId, async (req, res) => {
    try {
      if (`${req.user._id}` === `${req.params.userId}`) {
        return res
          .status(403)
          .json({ success: false, message: "You can't unfollow yourself" });
      }
      //check if user with userId exist
      let userDoc = await User.findById(req.params.userId).lean();
      if (userDoc) {
        //get followDoc
        //get the one getting follow doc
        let [followDoc, beingFollowedDoc] = await Promise.all([
          Follow.findOne({ author: req.user._id }).exec(),
          Follow.findOne({
            author: req.params.userId,
          }).exec(),
        ]);
        //check if the userId is exists in following list and that one being follow follower list
        let followingIndex = followDoc.following.findIndex(
          (userId) => `${userId}` === `${req.params.userId}`
        );
        let beingFollowedIndex = beingFollowedDoc.follower.findIndex(
          (userId) => `${userId}` === `${req.user._id}`
        );
        //exists
        if (followingIndex !== -1 && beingFollowedIndex !== -1) {
          beingFollowedDoc.follower.splice(beingFollowedIndex, 1);
          //update follower count
          // beingFollowedDoc.followerCount = beingFollowedDoc.follower.length;

          followDoc.following.splice(followingIndex, 1);
          //update following count
          // followDoc.followingCount = followDoc.following.length;
          //save both in parallel
          await Promise.all([followDoc.save(), beingFollowedDoc.save()]);
          res.status(200).json({
            success: true,
            message: "Unfollow successfully",
            followDoc,
          });
        } else {
          res.status(403).json({
            success: false,
            message: "You haven't followed this user",
          });
        }
      } else {
        res.status(403).json({ success: false, message: "User not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  });

module.exports = followRouter;
