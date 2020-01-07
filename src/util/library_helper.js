/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const AWS = require('aws-sdk');
const fs = require('fs');
const FCM = require('fcm-node');
const Sequelize = require('sequelize');
const debug = require('debug');

const { sequelize } = require('../database-config/connection');
const {
  Competitions,
  Competition_Banners,
  Competition_Videos,
} = require('../models/v1/competitions');
const categoryModel = require('../models/v1/categories');

const logger = require('../util/logger');
const { fcmNotificationMessages } = require('../models/v1/notifications');
const generatePushID = require('../../src/util/pushid');
const helper = require('../../src/util/helper');
const config = require('../config/config');

const log = debug('http:library_helper');

const libraryHelper = {};

libraryHelper.getHashtagPosts = async (hashtagId) => {
  const qry = `SELECT posts.id, user_id, category_id, title, media_url, thumbnail_url, posts.created_at, users.avatar, users.fullname, users.username, (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count, (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count, (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count FROM posts INNER JOIN users ON users.id=posts.user_id INNER JOIN hashtagposts ON posts.id=hashtagposts.post_id WHERE hashtagposts.hashtag_id='${hashtagId}' AND posts.deleted=0 ORDER BY created_at DESC`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const allposts = await helper.getPost(results);
  const response = await helper.filterUnpublishedCompetitionPost(allposts);
  return response;
};

libraryHelper.get_user_details = async (userDetail, payload) => {
  userDetail.email = payload.email;
  userDetail.phone_number = payload.phone_number;
  userDetail.email = payload.email;
  userDetail.gender = payload.gender;
  userDetail.height = payload.height;
  userDetail.date_of_birth = payload.date_of_birth;
  userDetail.eye_colour = payload.eye_colour;
  userDetail.skin_colour = payload.skin_colour;
  userDetail.biography = payload.biography;
  userDetail.website = payload.website;
  userDetail.address = payload.address;

  const updatedUserDetail = await userDetail.save();
  return updatedUserDetail;
};

libraryHelper.getUserLikeStatus = async (loggedinUserId, postId) => {
  const qry = `SELECT * FROM likes WHERE user_id='${loggedinUserId}' AND post_id='${postId}'`;
  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const result = results[0];
  return result.status;
};

libraryHelper.getUserDetailsFromUserID = async (userId) => {
  const qry = `SELECT U.*, D.device_token FROM users U
  INNER JOIN device_token_registrations D ON U.id=D.user_id WHERE U.id='${userId}'`;
  const result = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return result[0];
};

libraryHelper.getUserDetailsFromPostID = async (postId) => {
  const qry = `SELECT U.id, U.fullname, U.username, U.avatar, D.device_token FROM users U
  INNER JOIN device_token_registrations D ON U.id=D.user_id
  INNER JOIN posts P ON U.id=P.user_id
  WHERE P.id='${postId}'`;
  const result = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  return result[0];
};

libraryHelper.getFollowers = async (userId) => {
  const qry = `SELECT U.id, U.fullname, U.username, U.avatar, D.device_token FROM users U
  INNER JOIN device_token_registrations D ON U.id=D.user_id WHERE U.id='${userId}'`;

  const result = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return result;
};

const saveNotification = async (message, notificationType) => {
  const notifMessage = {
    id: generatePushID(),
    user_id: message.receiverId,
    notification_message: JSON.stringify(message),
    notification_type: notificationType,
  };
  fcmNotificationMessages.create(notifMessage);
};

libraryHelper.sendFCMNotification = async (message, notificationType) => {
  const serverKey = config.fcmServerKey;
  const fcm = new FCM(serverKey);
  const newMessage = {
    to: message.token,
    // collapse_key: 'your_collapse_key',
    // notification: message.notification,
    data: message.data,
  };

  saveNotification(message, notificationType);

  fcm.send(newMessage, (err, response) => {
    if (err) {
      // logger.info('Something has gone wrong!');
      log(err);
    } else {
      logger.info('Successfully sent with response: ', response);
    }
  });
};

const searchUser = async (query, loggedinUserId) => {
  const sanitizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_.]+/, '');

  const qry = `SELECT "id", "auth_id", "auth_type", "avatar", "username", "fullname", "password", "role_id", "token", "created_at" AS "createdAt", "updated_at" AS "updatedAt", (SELECT status FROM follows WHERE follows.user_id=users.id AND follows.follower_id='${loggedinUserId}') AS  follow_status
  FROM "users" AS "users" WHERE (lower("fullname") LIKE '%${sanitizedQuery}%' OR lower("username") LIKE '%${sanitizedQuery}%')`;

  const response = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return response;
};

const searchCompetition = async (query) => {
  const sanitizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[\W_]+/, '');

  const competition = await Competitions.findAll({
    where: {
      name: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('title')),
        'LIKE',
        `%${sanitizedQuery}%`,
      ),
      status: 'published',
    },
    include: [
      {
        model: Competition_Banners,
        attributes: ['id', 'banner_url'],
        required: false,
      },
      {
        model: Competition_Videos,
        attributes: ['id', 'video_url'],
        required: false,
      },
    ],
  });
  const payload = [];
  for (let i = 0; i < competition.length; i += 1) {
    if (competition[i]) {
      const temp = await helper.getCompetitionPost(competition[i]);
      payload.push(temp);
    }
  }
  return payload;
};

const searchHashtag = async (query) => {
  const sanitizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[\W_]+/, '');

  const qry = `SELECT "id", "name", "created_at" AS "createdAt", "updated_at" AS "updatedAt", (SELECT COUNT(*) FROM hashtagposts
  where hashtag_id=hashtags.id ) AS post_counts
  FROM "hashtags"
  WHERE lower("name") LIKE '%${sanitizedQuery}%'`;

  const response = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const hashtagPayload = [];
  for (let i = 0; i < response.length; i += 1) {
    const hashtagpost = await libraryHelper.getHashtagPosts(response[i].id);
    const hashtag = {};

    hashtag.id = response[i].id;
    hashtag.name = response[i].name;
    hashtag.totalPostCount = response[i].post_counts;
    hashtag.posts = hashtagpost;

    hashtagPayload.push(hashtag);
  }
  return hashtagPayload;
};

const searchCategory = async (query) => {
  const sanitizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[\W_]+/, '');

  const allCategories = await categoryModel.findAll({
    where: {
      name: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('name')),
        'LIKE',
        `%${sanitizedQuery}%`,
      ),
    },
  });

  const categoryPayload = [];
  let temp;
  const talent = {};
  for (let i = 0; i < allCategories.length; i += 1) {
    const talentpost = await libraryHelper.getTalentPosts(allCategories[i].id);
    talent.id = allCategories[i].id;
    talent.name = allCategories[i].name;
    temp = await helper.getTotalNoOfPost(allCategories[i].id, 'category');
    talent.totalPostCount = temp[0].count;
    talent.posts = talentpost;

    categoryPayload.push(talent);
  }
  return categoryPayload;
};

libraryHelper.search = async (req) => {
  const searchtable = {
    user: searchUser,
    competition: searchCompetition,
    category: searchCategory,
    hashtag: searchHashtag,
  };

  const response = await searchtable[req.query.key](req.query.value, req.headers.user_id);
  return response;
};

libraryHelper.upload = async (path, name, type) => {
  const data = await new Promise((resolve) => {
    fs.readFile(path, (err, response) => {
      if (err) {
        resolve(err);
      }
      resolve(response);
    });
  });

  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    Bucket: process.env.BUCKET_NAME,
  });
  const bucketName = {
    banner: `${process.env.BUCKET_NAME}/banners`,
    adBanners: `${process.env.BUCKET_NAME}/adBanners`,
    thumbnail: `${process.env.BUCKET_NAME}/screenshots`,
    video: `${process.env.BUCKET_NAME}/videos`,
    post: `${process.env.BUCKET_NAME}/posts`,
  };

  const params = {
    Bucket: bucketName[type],
    Key: name,
    Body: data,
    ACL: 'public-read',
  };

  const result = await new Promise((resolve) => {
    s3.upload(params, (error, response) => {
      if (error) {
        resolve({
          statusCode: 400,
          error: `Could not create message: ${error.stack}`,
        });
      } else {
        resolve({ statusCode: 200, body: response });
      }
    });
  });

  return result;
};

libraryHelper.getTalentPosts = async (categoryId) => {
  const qry = `SELECT posts.id, user_id, category_id, title, media_url, thumbnail_url, posts.created_at, users.avatar, users.fullname, users.username, (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count, (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count, (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count FROM posts INNER JOIN users ON users.id=posts.user_id  WHERE posts.category_id='${categoryId}' AND posts.deleted=0 ORDER BY created_at DESC`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const allposts = await helper.getPost(results);
  const newPosts = helper.filterUnpublishedCompetitionPost(allposts);
  return newPosts;
};

module.exports = libraryHelper;
