const express = require("express");
const Hashtag = require("../models/hashtag");
const Post = require("../models/post");
const verify = require("../verify");

//Search by hashtag
//Top 10 hashtag by most postCount
//Add hashtag to following doc

const hashtagRouter = express.Router();
hashtagRouter
  .route("/:hashtagId")
  .get(verify.verifyHashtagId, async (req, res) => {
    try {
      let hashtagDoc = await Hashtag.findById(req.params.hashtagId).lean();
      if (hashtagDoc) {
        //found parallel all post in hashtag.postIds array
        let postIdList = hashtagDoc.postIds;
        let posts = await Promise.all(
          postIdList.map(async (postId) => {
            let post = await Post.findById(postId).exec();
            if (post) {
              post = await post
                .populate({ path: "author", select: ["username"] })
                .populate({ path: "hashtags", select: ["hashtag"] })
                //TODO: Populate all needed fields be4 returned
                .execPopulate();
              return post;
            }
          })
        );
        //Filter all null ele out of posts
        posts = posts.filter((post) => {
          if (post !== null) {
            return true;
          } else {
            return false;
          }
        });
        res.status(200).json({ success: true, posts });
      } else {
        res.status(403).json({ success: false, message: "Hashtag not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  });

module.exports = hashtagRouter;
