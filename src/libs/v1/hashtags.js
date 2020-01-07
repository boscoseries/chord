/* eslint-disable no-await-in-loop */
const { Hashtag } = require('../../models/v1/hashtags');
const helper = require('../../util/helper');

const generatePushID = require('../../util/pushid');

const hashtag = {};

hashtag.getAllHashtags = async (payload) => {
  const hashtags = await Hashtag.findAll({
    attributes: ['id', 'name'],
  });

  const hashtagPayload = [];
  for (let i = 0; i < hashtags.length; i += 1) {
    const hashtagPost = await helper.getHashtagPosts(hashtags[i].id, payload);
    const totalPostCount = await helper.getTotalNoOfPost(hashtags[i].id, 'hashtag');
    const hashtagDetails = {};
    hashtagDetails.id = hashtags[i].id;
    hashtagDetails.name = hashtags[i].name;
    hashtagDetails.totalPostCount = totalPostCount[0].count;
    hashtagDetails.posts = hashtagPost;

    hashtagPayload.push(hashtagDetails);
  }
  return hashtagPayload;
};

hashtag.createHashtag = async (req) => {
  const { name } = req.body;
  const data = {
    id: generatePushID(),
    name,
  };

  const response = await Hashtag.create(data);
  return response;
};

hashtag.getHashtag = async (payload) => {
  const hashtags = await Hashtag.findOne({
    attributes: ['id', 'name'],
    where: {
      id: payload.id,
    },
  });

  const hashtagPost = await helper.getHashtagPosts(hashtags.id, payload);
  const totalPostCount = await helper.getTotalNoOfPost(hashtags.id, 'hashtag');
  const hashtagDetails = {};
  hashtagDetails.id = hashtags.id;
  hashtagDetails.name = hashtags.name;
  hashtagDetails.totalPostCount = totalPostCount[0].count;
  hashtagDetails.posts = hashtagPost;

  return hashtagDetails;
};

module.exports = hashtag;
