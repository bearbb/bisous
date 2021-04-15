const ObjectId = require("mongoose").Types.ObjectId;
exports.verifyPost = (postData) => {
  let err = {};
  //check if any picture exist
  if (postData.pictures && postData.pictures.length <= 0) {
    err.pictures = "No picture was given";
  }
  if (!postData.caption) {
    err.caption = "No caption was given";
  }
  if (!postData.hashtags) {
    err.hashtags = "No hashtags was given";
  }
  return err;
};

exports.verifyPostId = (req, res, next) => {
  if (ObjectId.isValid(req.params.postId)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not a valid id" });
  }
};

exports.verifyCommentId = (req, res, next) => {
  if (ObjectId.isValid(req.params.commentId)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not a valid id" });
  }
};

exports.verifyUserId = (req, res, next) => {
  if (ObjectId.isValid(req.params.userId)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not a valid id" });
  }
};
exports.verifyHashtagId = (req, res, next) => {
  if (ObjectId.isValid(req.params.hashtagId)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not a valid id" });
  }
};

exports.verifyReceiverId = (req, res, next) => {
  if (ObjectId.isValid(req.params.receiverId)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not a valid id" });
  }
};
