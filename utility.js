const Hashtag = require("./models/hashtag");
/**
 *  `getAllHashtagIds` get all hashtag._id from hashtags array in database
 * @async
 * @param {*} hashtagList from req.body.hashtags
 * @returns {Array} an array contain all hashtag id
 */
async function getAllHashtagIds(hashtagList) {
  //find all hashtagId that already exist, which not exist then create new hashtag doc
  //loop through all hashtag
  //push all hashtagDoc._id to an arr then add it to postDoc
  let hashtagsArrForPost = [];
  const getAllHashtagId = hashtagList.map(async (hashtag) => {
    try {
      let hashtagDoc = await Hashtag.findOne({
        hashtag: `${hashtag}`,
      }).exec();
      if (hashtagDoc) {
        hashtagsArrForPost.push(hashtagDoc._id);
      } else {
        let newHashtagDoc = new Hashtag({ hashtag: `${hashtag}` });
        newHashtagDoc = await newHashtagDoc.save();
        hashtagsArrForPost.push(newHashtagDoc._id);
      }
    } catch (err) {
      console.error(err);
      return err;
    }
  });
  let resp = await Promise.all(getAllHashtagId);
  hashtagsArrForPost = hashtagsArrForPost.map((hashtag) => `${hashtag}`);
  return hashtagsArrForPost;
}
/**
 *  To add into all hashtag doc with new postId that just create
 * @async
 * @param {[]} hashtagList list that contain all hashtagId need to update
 * @param {string} postId to add to postIds array on hashtag doc
 * @return void
 */
async function addPostIdToHashtagList(hashtagList, postId) {
  const addPostIdToEachHashtag = hashtagList.map(async (hashtag) => {
    try {
      let hashtagDoc = await Hashtag.findById(hashtag).exec();
      hashtagDoc.postIds.unshift(postId);
      //update postCount
      hashtagDoc.postCount = hashtagDoc.postIds.length;
      hashtagDoc = await hashtagDoc.save();
    } catch (err) {
      console.error(err);
    }
  });
  const respForAddPostId = await Promise.all(addPostIdToEachHashtag);
}

/**
 * Too delete postId from all hashtagDoc in hashtagList
 * @async
 * @param {[]} hashtagList array of hashtagId
 * @param {String} postId id to be delete
 */
async function deletePostIdFromHashtagList(hashtagList, postId) {
  const delPostIdFromEachHashtag = hashtagList.map(async (hashtag) => {
    try {
      let hashtagDoc = await Hashtag.findById(hashtag).exec();
      //if that hashtagDoc exists
      if (hashtagDoc) {
        let index = hashtagDoc.postIds.findIndex(
          (postIdInHashtag) => `${postIdInHashtag}` === `${postId}`
        );
        if (index >= 0) {
          hashtagDoc.postIds.splice(index, 1);
          //update postCount
          hashtagDoc.postCount = hashtagDoc.postIds.length;
          hashtagDoc = await hashtagDoc.save();
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  let resp = await Promise.all(delPostIdFromEachHashtag);
}

exports.getAllHashtagIds = getAllHashtagIds;
exports.addPostIdToHashtagList = addPostIdToHashtagList;
exports.deletePostIdFromHashtagList = deletePostIdFromHashtagList;
