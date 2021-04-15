const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const utility = require("../utility");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .get(authenticate.verifyUser, async (req, res) => {
    try {
      let favorite = await Favorite.findOne({ author: req.user._id }).exec();
      favorite = await favorite.populate({ path: "favorites" }).execPopulate();
      res.status(200).json({ success: true, favorite });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .post(authenticate.verifyUser, async (req, res) => {
    try {
      //check if any postId is provide
      if (req.body.postIdList && req.body.postIdList.length >= 1) {
        //filter postIDList
        let postIdList = await utility.filterValidPostIdFromArrList(
          req.body.postIdList
        );
        //update favorite
        let favorite = await utility.updateFavoritePost(
          postIdList,
          req.user._id
        );
        favorite = await favorite
          .populate({ path: "author", select: ["username"] })
          .populate({ path: "favorites" })
          .execPopulate();
        res
          .status(200)
          .json({ success: true, message: "Added successfully", favorite });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  })
  .put((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support PUT operation" });
  })
  .delete(authenticate.verifyUser, async (req, res) => {
    try {
      //get favoriteDoc
      let favoriteDoc = await Favorite.findOne({ author: req.user._id }).exec();
      //check exists
      if (favoriteDoc) {
        //delete all element in favorites arr
        favoriteDoc.favorites = [];
        favoriteDoc = await favoriteDoc.save();
        res
          .status(200)
          .json({ success: true, message: "Delete successfully", favoriteDoc });
      } else {
        res
          .status(403)
          .json({ success: false, message: "No favorite document was found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  });

favoriteRouter
  .route("/:postId")
  .get((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support GET operation" });
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
  .delete(authenticate.verifyUser, async (req, res) => {
    try {
      let favorite = await Favorite.findOne({ author: req.user._id }).exec();
      //find if favoriteId from params exist
      let index = favorite.favorites.findIndex(
        (postId) => `${postId}` === req.params.postId
      );
      console.log(index);
      if (index >= 0) {
        favorite.favorites.splice(index, 1);
        favorite = await favorite.save();
        res
          .status(200)
          .json({ success: true, message: "Delete successfully", favorite });
      } else {
        res.status(403).json({
          success: false,
          message: "You haven't add this post to your favorite",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  });

module.exports = favoriteRouter;
