const Hashtag = require("./models/hashtag");
const Post = require("./models/post");
const Favorite = require("./models/favorite");
const ObjectId = require("mongoose").Types.ObjectId;
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
          hashtagDoc = await hashtagDoc.save();
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  let resp = await Promise.all(delPostIdFromEachHashtag);
}

/**
 * To return an arr that contain valid postId (valid and exists)
 * @async
 * @param {[]} postList list contain postId to be checked
 * @return an array contain all valid postId
 */
async function filterValidPostIdFromArrList(postList) {
  let validIdArr = [];
  //check valid id all ele in postList
  validIdArr = postList.filter((postId) => ObjectId.isValid(postId));
  let validDocArr = [];
  //map async to find postDoc
  const getValidDocArr = validIdArr.map(async (postId) => {
    let postDoc = await Post.findById(postId).lean();
    if (postDoc) {
      validDocArr.push(postId);
    }
  });
  await Promise.all(getValidDocArr);
  return validDocArr;
}

/**
 * To update favorite doc with given postIdList
 * @async
 * @param {[]} postList list contain postId to be update (add if not exist)
 * @param {String} userId id of favorite owner need to be update
 * @return favorite object
 */
async function updateFavoritePost(postList, userId) {
  try {
    let favorite = await Favorite.findOne({ author: userId }).exec();
    //loop through all postList and find which is already exists => create new arr contain all postId not exists
    let notExistsPostArr = postList.map((postId) => {
      //find index in favorite.favorites
      //index = -1 => not exists
      let isExists =
        favorite.favorites.findIndex(
          (favoritePost) => `${favoritePost}` === `${postId}`
        ) === -1
          ? false
          : true;

      if (!isExists) {
        return postId;
      }
    });
    //filter notExistsPostArr before or this arr will contain null element
    notExistsPostArr = notExistsPostArr.filter((ele) => {
      if (ele == null) {
        return false;
      } else {
        return true;
      }
    });
    favorite.favorites.unshift(...notExistsPostArr);
    // favorite.favoriteCount =
    favorite = await favorite.save();
    return favorite;
  } catch (error) {
    console.error(error);
  }
}

/**
 * A function take hashtagId to delete its doc
 * @async
 * @returns void
 * @param {String} hashtagId to be deleted
 */
async function deleteHashtagDocWithId(hashtagId) {
  try {
    let deleteHashtag = await Hashtag.deleteOne({ _id: hashtagId });
    console.log("Delete successfully");
  } catch (err) {
    console.error(err);
  }
}

exports.getAllHashtagIds = getAllHashtagIds;
exports.addPostIdToHashtagList = addPostIdToHashtagList;
exports.deletePostIdFromHashtagList = deletePostIdFromHashtagList;
exports.filterValidPostIdFromArrList = filterValidPostIdFromArrList;
exports.updateFavoritePost = updateFavoritePost;
exports.deleteHashtagDocWithId = deleteHashtagDocWithId;
