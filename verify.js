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
