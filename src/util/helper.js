/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
const path = require('path');
const crypto = require('crypto');
const securePin = require('secure-pin');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const debug = require('debug');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
const log = debug('http:helper');

const { sequelize } = require('../database-config/connection');

const config = require('../config/config');
const logger = require('../../src/util/logger');
const generatePushID = require('../util/pushid');
const { Hashtag, HashtagPosts } = require('../models/v1/hashtags');

const helper = {};

helper.sendNotifications = async (data) => {
  const {
    subject, htmlMSG, plainMSG,
  } = data;
  const htmlEmail = {
    subject,
    body: htmlMSG,
  };
  const plainEmail = {
    subject,
    body: plainMSG,
  };
  switch (data) {
    case data.phone_number && !data.email:
      helper.sendSMS(data.phone_number, data.smsMSG);
      break;
    case data.email && !data.phone_number:
      helper.sendEmail(data.email, htmlEmail, plainEmail);
      break;
    case data.phone_number && data.email:
      helper.sendSMS(data.phone_number, data.smsMSG);
      helper.sendEmail(data.email, htmlEmail, plainEmail);
      break;
    default:
      helper.sendSMS(data.phone_number, data.smsMSG);
      helper.sendEmail(data.email, htmlEmail, plainEmail);
  }
};

helper.filterUnpublishedCompetitionPost = (arr) => {
  const newArr = [];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].competition) {
      // log(arr[i].competition);
      const date = arr[i].competition.vote_start_date;

      const voteStartDate = new Date(date);

      const todaysDate = new Date();

      if (todaysDate >= voteStartDate) {
        newArr.push(arr[i]);
      }
    } else {
      newArr.push(arr[i]);
    }
  }
  return newArr;
};

helper.getHashtagPosts = async (hashtagId, payload) => {
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;
  const qry = `SELECT posts.id, user_id, category_id, title,
  media_url, thumbnail_url, posts.created_at, posts.post_duration,
  users.avatar, users.fullname, users.username,
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count
  FROM posts
  INNER JOIN users ON users.id=posts.user_id
  INNER JOIN hashtagposts ON posts.id=hashtagposts.post_id
  WHERE hashtagposts.hashtag_id='${hashtagId}' AND posts.deleted=0
  ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const allposts = await helper.getPost(results);
  const response = helper.filterUnpublishedCompetitionPost(allposts);
  return response;
};

helper.getCompetitionInfo = async (postId, loggedInUserId) => {
  const query = `SELECT posts.competition_id, c.title,c.submission_start_date, c.submission_end_date, c.vote_end_date,c.vote_start_date, (SELECT COUNT(*) FROM competition_judges WHERE user_id='${loggedInUserId}' AND competition_id=posts.competition_id) AS judge_status,
(SELECT vote FROM competition_votes WHERE user_id='${loggedInUserId}' AND post_id='${postId}' AND competition_id=posts.competition_id) AS vote_status FROM posts INNER JOIN competitions c ON posts.competition_id=c.id
WHERE posts.id='${postId}' AND posts.deleted=0`;

  const competitionInfo = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return competitionInfo[0];
};

helper.getPostDetails = async (postId) => {
  const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title,
  posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration, users.avatar, users.fullname, users.username,
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count FROM posts
  INNER JOIN users ON users.id=posts.user_id
  WHERE posts.id='${postId}' AND deleted=0`;
  const competitionPosts = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const competitionFeed = await helper.getPost(competitionPosts);
  return competitionFeed;
};

const randomizePost = async (randomPost) => {
  let i = randomPost.length;
  const temp = [...randomPost];

  while (i--) {
    const ri = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[ri]] = [temp[ri], temp[i]];
  }
  return temp;
};

const getRandomPost = async (posts, userId, competitionId) => {
  let temp;
  const index = posts.findIndex(post => post.user_info.user_id === userId);

  if (index !== -1) {
    temp = posts[index];
    posts.splice(index, 1);
    posts.unshift(temp);
    return posts;
  }

  const query = `SELECT posts.id, user_id, category_id, posts.title,media_url, thumbnail_url, posts.created_at, post_duration,users.avatar, users.fullname, users.username,
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id)
  AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id)
  AS comment_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id)AS share_count,
  (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${userId}') AS bookmark_status,
  (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${userId}') AS post_like_status FROM posts
  INNER JOIN users ON users.id=posts.user_id
  INNER JOIN competitions ON competitions.id=posts.competition_id
  WHERE posts.user_id='${userId}' AND competitions.id='${competitionId}' AND posts.deleted=0`;

  const postdetails = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  const postFeed = await helper.getPost(postdetails, userId, competitionId);

  if (postFeed[0]) {
    posts.unshift(postFeed[0]);
    return posts;
  }

  return posts;
};

helper.totalPostcount = async (competitionId) => {
  const query = `SELECT COUNT(*) FROM posts WHERE posts.competition_id='${competitionId}' AND posts.deleted=0`;

  const counts = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return counts[0];
};

helper.getTopPosts = async (competitionId, loggedInUser) => {
  const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title,
  posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration, users.avatar, users.fullname, users.username, gains AS gain,
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
  (SELECT SUM(points) FROM post_view_counts WHERE post_view_counts.post_id=posts.id) AS  post_view_count,
  (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${loggedInUser}') AS  post_like_status FROM posts
  INNER JOIN users ON users.id=posts.user_id
  WHERE posts.deleted=0 AND posts.competition_id='${competitionId}' ORDER BY gain DESC LIMIT 20`;

  const topPosts = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const postsFeed = await helper.getPost(topPosts, loggedInUser, competitionId);
  return postsFeed;
};

helper.schedulerDetails = async (competitionId) => {
  const qry = `SELECT posts.updated_at, competitions.update_interval from posts
INNER JOIN competitions on competitions.id = '${competitionId}'
where posts.competition_id = '${competitionId}'
LIMIT 1`;

  const timerDetails = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return timerDetails;
};

helper.getCompetitionPost = async (competition, payload = {}) => {
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;
  const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title,
  posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration, users.avatar, users.fullname, users.username, gains AS gain,
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
  (SELECT SUM(points) FROM post_view_counts WHERE post_view_counts.post_id=posts.id) AS  post_view_count,
  (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${payload.loggedInUser}') AS  post_like_status FROM posts
  INNER JOIN users ON users.id=posts.user_id
  WHERE posts.deleted=0 AND posts.competition_id='${competition.id}' ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const competitionPosts = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const query = `SELECT fullname, avatar, users.id from users
  INNER JOIN competition_judges cj ON cj.user_id=users.id
  WHERE cj.competition_id='${competition.id}'`;

  const judges = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  const statusQry = `SELECT * FROM posts p
  WHERE p.deleted=0 AND p.competition_id='${competition.id}' AND p.user_id='${payload.loggedInUser}'`;

  const status = await sequelize.query(statusQry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const userCompetitionStatus = status[0] ? 1 : 0;

  let subscribed;
  if (payload.loggedInUser) {
    const subscriptionQry = `SELECT subscribed FROM competition_subscriptions
WHERE competition_id = '${competition.id}' AND user_id = '${payload.loggedInUser}';
  `;
    const subc = await sequelize.query(subscriptionQry, {
      type: sequelize.QueryTypes.SELECT,
    });
    subscribed = subc[0] !== undefined ? subc[0].subscribed : 0;
  } else {
    subscribed = 0;
  }

  const competitionFeed = await helper.getPost(
    competitionPosts,
    payload.loggedInUser,
    competition.id,
  );

  const randomFeed = await randomizePost(competitionFeed);

  let newCompetitionPost;
  if (payload.pageNo === 0) {
    newCompetitionPost = await getRandomPost(randomFeed, payload.loggedInUser, competition.id);
  }
  newCompetitionPost = randomFeed;

  const postCount = await helper.totalPostcount(competition.id);
  return {
    competition,
    judges,
    competitionFeed: newCompetitionPost,
    subscribed,
    total_posts_count: +postCount.count,
    userCompetitionStatus,
  };
};

const getComments = async (id) => {
  const qry = `SELECT comments.id, comments.comment, comments.created_at, users.id AS commenter_id,
    users.avatar AS commenter_avatar, users.username AS commenter_name
    FROM comments INNER JOIN users ON comments.user_id=users.id
    WHERE comments.post_id= '${id}' ORDER BY comments.updated_at DESC`;
  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return results;
};

helper.getPostHashtags = async (postId) => {
  const query = `SELECT hashtags.id, hashtags.name from hashtags
  INNER JOIN hashtagposts ON hashtagposts.hashtag_id=hashtags.id
  WHERE hashtagposts.post_id='${postId}'`;

  const hashtags = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return hashtags;
};

helper.getTotalNoOfPost = async (tableId, type) => {
  const table = {
    hashtag: `SELECT COUNT(*) FROM hashtagposts
    INNER JOIN posts ON posts.id=hashtagposts.post_id
    WHERE hashtag_id='${tableId}' AND posts.deleted=0`,
    category: `SELECT COUNT(*) FROM posts
    WHERE posts.category_id='${tableId}'
    AND posts.deleted=0`,
    user: `SELECT COUNT(*) FROM posts
    INNER JOIN likes ON posts.id=likes.post_id
    WHERE likes.user_id='${tableId}'
    AND posts.deleted=0 AND likes.status=1;`,
  };
  const query = table[type];

  const response = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return response;
};

helper.getPost = async (results, loggedInUserId) => {
  const allposts = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const result of results) {
    const thepost = {};
    const userinfo = {};
    const post = result;
    thepost.id = post.id;
    thepost.total_posts_count = post.total_posts_count;
    thepost.auth_id = post.auth_id;
    thepost.auth_type = post.auth_type;
    thepost.category_id = post.category_id;
    thepost.title = post.title;
    thepost.media_url = post.media_url;
    thepost.thumbnail_url = post.thumbnail_url;
    thepost.created_at = post.created_at;
    thepost.post_duration = post.post_duration;
    thepost.total_post = post.total_post;
    userinfo.user_id = post.user_id;
    userinfo.role_id = post.role_id;
    userinfo.fullname = post.fullname;
    userinfo.username = post.username;
    userinfo.avatar = post.avatar;
    thepost.user_info = userinfo;
    thepost.comments = await getComments(post.id);
    thepost.hashtags = await helper.getPostHashtags(post.id);
    thepost.competition = await helper.getCompetitionInfo(post.id, loggedInUserId);
    thepost.post_view_count = post.post_view_count;
    thepost.comment_count = post.comment_count;
    thepost.like_count = post.like_count;
    thepost.post_shares_count = post.share_count;
    thepost.post_gain = post.gain;
    thepost.post_like_status = post.post_like_status;
    thepost.bookmark_status = post.bookmark_status;
    allposts.push(thepost);
  }
  return allposts;
};

helper.generatePin = () => {
  const pin = securePin.generatePinSync(6);
  return pin;
};

helper.sendSMS = async (msisdn, textmsg) => {
  const twilioclient = twilio(config.twiliosSID, config.twilioAuthToken);
  const fromMsisdn = config.twilioMobile;
  twilioclient.messages
    .create({
      body: textmsg,
      from: fromMsisdn,
      to: msisdn,
    })
    .then(message => logger.info(message.sid));
};

const getEmailTemplate = async () => {
  // eslint-disable-next-line global-require
  const fs = require('fs');

  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'mail.html'), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};

helper.sendEmail = async (email, htmlEmail, plainEmail) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.FROM_EMAIL, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // eslint-disable-next-line no-use-before-define
  let htmlEmailTemplate = await getEmailTemplate();
  htmlEmailTemplate = htmlEmailTemplate.replace('{message}', htmlEmail.body);
  const info = await transporter.sendMail({
    from: '"mAudition " <noreply@maudition.com>',
    to: email, // list of receivers
    subject: htmlEmail.subject,
    text: plainEmail.body,
    html: htmlEmailTemplate,
  });

  logger.info('Message sent: %s', info.messageId);
  logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

helper.getTimeStamp = () => {
  const d = new Date();
  const tstamp = `${d.getFullYear()}-${d.getMonth()
    + 1}-${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  return tstamp;
};

helper.hashpassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
};

helper.isValid = async (competitionId, userId) => {
  const query = `select * from competition_subscriptions where competition_id = '${competitionId}' and user_id = '${userId}'`;
  const response = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  return response;
};

helper.joinedBefore = async (competitionId, userId) => {
  const query = `SELECT posts.competition_id FROM posts
  WHERE deleted=0 AND posts.competition_id='${competitionId}'
  AND posts.user_id='${userId}'`;

  const response = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return response;
};

helper.getPointsGained = async (userId, postId) => {
  const query = `SELECT gains FROM post_view_counts
WHERE post_view_counts.post_id='${postId}'
AND post_view_counts.user_id='${userId}'`;
  const response = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return response;
};

helper.processHashtag = async (hashtags, postId) => {
  hashtags.split(',').map(hashtag => helper.searchHashtag(hashtag, postId));
};

helper.searchHashtag = async (hashtag, postId) => {
  if (!!hashtag.trim() === false) {
    return;
  }
  const sanitizedQuery = hashtag
    .trim()
    .toLowerCase()
    .replace(/[\W_]+/, '');
  const response = await Hashtag.findOne({
    where: {
      name: sanitizedQuery,
    },
  });

  if (response == null) {
    const hashtagData = await Hashtag.create({ id: generatePushID(), name: sanitizedQuery });
    const id = await generatePushID();
    const hashtagPostBody = {
      id,
      hashtag_id: hashtagData.id,
      post_id: postId,
    };
    await HashtagPosts.create(hashtagPostBody);
    return;
  }

  const id = await generatePushID();
  const hashtagPostBody = {
    id,
    hashtag_id: response.id,
    post_id: postId,
  };
  await HashtagPosts.create(hashtagPostBody);
};

helper.decrypt = (text) => {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.key, 'hex'), Buffer.from(process.env.iv, 'hex'));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

helper.updatePhoneNumber = async (phone, userId) => {
  const qry = `UPDATE users
  SET phone_number = '${phone}'
  WHERE id = '${userId}'`;
  await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
};

helper.hasPhoneNumber = async (userId) => {
  const qrys = `SELECT phone_number FROM users
      WHERE users.id='${userId}'`;
  const result = await sequelize.query(qrys, {
    type: sequelize.QueryTypes.SELECT,
  });

  if (!result[0].phone_number) {
    return {
      status: 404,
      error: 'update phone number',
    };
  }
  return {
    status: 200,
    message: 'phone number available',
  };
};

module.exports = helper;
