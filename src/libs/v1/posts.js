const dotenv = require('dotenv');

dotenv.config();
const formidable = require('formidable');
const debug = require('debug');
const { Post, PostViewCount } = require('../../models/v1/posts');
const { PostBookmarks } = require('../../models/v1/posts');
const { sequelize, Op } = require('../../database-config/connection');
const { Like } = require('../../models/v1/likes');
const postShares = require('../../models/v1/post_shares');
const { User } = require('../../models/v1/users');
const generatePushID = require('../../util/pushid');
const helper = require('../../util/helper');
const notificationLibrary = require('../../libs/v1/notifications');
const libraryHelper = require('../../util/library_helper');

const log = debug('http:post');

const postLibrary = {};

postLibrary.getAll = (req, res) => {
  Post.findAll()
    .then((postData) => {
      res.json(postData);
    })
    .catch(error => res.json(error));
};

postLibrary.getNewsfeed = async (req, res) => {
  let loggedinUserId;
  const next = +req.query.pageNo || 0;
  const limit = +req.query.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;

  let qry = `SELECT posts.id, user_id, category_id, title, media_url, thumbnail_url, posts.created_at, post_duration, users.avatar, users.fullname, users.username, (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count, (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count, (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count FROM posts INNER JOIN users ON users.id=posts.user_id
  WHERE posts.deleted=0
  ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  if (req.headers.user_id) {
    loggedinUserId = req.headers.user_id;
    qry = `SELECT posts.id, user_id, category_id, title, media_url, thumbnail_url, posts.created_at, post_duration, users.avatar, users.fullname, users.username,
    (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
    (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
    (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${loggedinUserId}') AS  bookmark_status,
    (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${loggedinUserId}') AS  post_like_status FROM posts INNER JOIN users ON users.id=posts.user_id
    WHERE posts.deleted=0
    ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  }

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const newsfeed = await helper.getPost(results, loggedinUserId);
  res.send(newsfeed);
};

postLibrary.getPersonalizedNewsFeed = async (req) => {
  const next = +req.query.pageNo || 0;
  const limit = +req.query.pageSize || 15;
  let loggedinUserId;
  let qry;

  const offset = next >= 1 ? limit * next - limit : 0;

  if (req.headers.user_id) {
    loggedinUserId = req.headers.user_id;
    qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title, posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration, users.avatar, users.fullname, users.username,
    (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
    (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
    (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND posts.user_id='${loggedinUserId}') AS  bookmark_status,
    (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${loggedinUserId}') AS  post_like_status FROM posts
    INNER JOIN users ON users.id=posts.user_id
    INNER JOIN follows ON follows.user_id=users.id WHERE follows.follower_id='${loggedinUserId}' AND follows.status=1 AND posts.deleted=0 ORDER BY posts.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    try {
      const results = await sequelize.query(qry, {
        type: sequelize.QueryTypes.SELECT,
      });
      const newsfeed = await helper.getPost(results, loggedinUserId);
      return newsfeed;
    } catch (error) {
      return { status: 404, error: error.message };
    }
  }
  return { status: 400, error: 'User ID missing' };
};

postLibrary.getBookMarks = async (loggedinUserId) => {
  const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title,
    posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration, users.avatar, users.fullname, users.username,
     (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
     (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
     (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
     (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${loggedinUserId}') AS  bookmark_status,
     (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${loggedinUserId}') AS  post_like_status FROM posts
     INNER JOIN users ON users.id=posts.user_id INNER JOIN post_bookmarks ON post_bookmarks.post_id=posts.id
     WHERE post_bookmarks.user_id='${loggedinUserId}' AND posts.deleted=0
     ORDER BY posts.created_at DESC`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const newsfeed = await helper.getPost(results, loggedinUserId);

  if (newsfeed) {
    return newsfeed;
  }
  return false;
};

postLibrary.getOne = async (payload) => {
  const post = await Post.findByPk(payload.id);
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;
  const offset = next >= 1 ? limit * next - limit : 0;
  if (post) {
    try {
      const query = `SELECT posts.id, posts.user_id, posts.category_id, posts.title, posts.media_url, posts.thumbnail_url,
      posts.created_at, posts.post_duration, users.avatar, users.role_id, users.fullname, users.username,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id=posts.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS comment_count,
      (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS share_count,
      (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS post_like_status,
      (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS bookmark_status
      FROM posts 
      INNER JOIN users ON users.id=posts.user_id
      WHERE posts.id='${payload.id}' AND posts.deleted=0
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const results = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      const allposts = await helper.getPost(results, payload.loggedInUserId);
      const response = await helper.filterUnpublishedCompetitionPost(allposts);
      return response;
    } catch (error) {
      return { status: 404, error: error.message };
    }
  }
};

postLibrary.createPost = async (req) => {
  const form = new formidable.IncomingForm();
  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      let media = {
        body: { Location: 'https://testurl.com/a-/someurltobeusedwhenintest' },
      };
      let thumbnail = { body: { Location: 'https://testurl.com/a-/someurltobeusedwhenintest' } };

      if (process.env.NODE_ENV !== 'test') {
        media = await libraryHelper.upload(files.media_url.path, files.media_url.name, 'post');
        thumbnail = await libraryHelper.upload(
          files.thumbnail_url.path,
          files.thumbnail_url.name,
          'thumbnail',
        );
      }

      const postBody = {
        id: generatePushID(),
        title: fields.caption,
        media_url: media.body.Location,
        thumbnail_url: thumbnail.body.Location,
        user_id: fields.user_id,
        category_id: fields.category_id,
        post_duration: +fields.post_duration || 0,
        deleted: 0,
      };

      try {
        const post = await Post.create(postBody);
        const response = await helper.getPostDetails(post.id);

        await helper.processHashtag(fields.hashtag, post.id);
        resolve(response[0]);
      } catch (error) {
        resolve({ error: error.message });
      }
    });
  });
};

const sendNotification = async (likes, deviceToken) => {
  const title = 'mAudition';
  const user = await libraryHelper.getUserDetailsFromPostID(likes.post_id);

  const post = await Post.findOne({
    where: {
      id: likes.post_id,
    },
  });
  const follower = await User.findOne({
    where: {
      id: likes.user_id,
    },
  });

  const totalLike = await Like.count({
    where: {
      post_id: post.id,
    },
  });

  const message = `${follower.username} liked your post`;
  const fcmtoken = user.device_token;

  const notificationData = {
    user_id: follower.id,
    post_id: likes.post_id,
    post_thumbnail: post.thumbnail_url,
    user_avatar: follower.avatar,
    username: follower.username,
    totalNoOfLike: totalLike,
    action: 'like',
  };
  const notificationObject = {
    title,
    token: fcmtoken,
    message_body: message,
    data: notificationData,
    receiverId: user.id,
    notification_type: 'like',
  };
  notificationLibrary.sendFCMNotification(notificationObject);
};

postLibrary.likes = async (req, res) => {
  const deviceToken = req.headers.device_token;
  const likes = await Like.findOne({
    where: {
      [Op.and]: [{ user_id: req.body.user_id }, { post_id: req.body.post_id }],
    },
  });

  if (likes) {
    if (likes.status) {
      likes.status = 0;
      await likes
        .save()
        .then(() => res.status(200).json('unlike'))
        .catch(error => res.status(500).json({ message: error.message }));
    } else {
      likes.status = 1;
      await likes
        .save()
        .then((like) => {
          sendNotification(like, deviceToken);
          res.status(200).json('like');
        })
        .catch(error => res.status(500).json({ message: error.message }));
    }
  } else {
    Like.create({
      id: generatePushID(),
      status: 1,
      user_id: req.body.user_id,
      post_id: req.body.post_id,
    })
      .then((like) => {
        sendNotification(like, deviceToken);
        res.status(200).json('like');
      })
      .catch(error => res.status(500).json({ message: error.message }));
  }
};

postLibrary.createBookMark = async (postId, userId) => {
  const bookmark = await PostBookmarks.findOne({
    where: {
      [Op.and]: [{ user_id: userId }, { post_id: postId }],
    },
  });

  if (bookmark) {
    if (bookmark.status) {
      bookmark.status = 0;
      await bookmark.save();
      return bookmark;
    }
    bookmark.status = 1;
    await bookmark.save();
    return bookmark;
  }
  const bookmarkPayload = {
    id: generatePushID(),
    post_id: postId,
    user_id: userId,
    status: 1,
  };
  const response = await PostBookmarks.create(bookmarkPayload);
  return response;
};

postLibrary.totalPoint = async (id) => {
  const query = `SELECT SUM(points) FROM post_view_counts WHERE post_view_counts.post_id='${id}'`;

  const sumPoints = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return sumPoints[0].sum;
};

postLibrary.createPostViewCount = async (payload) => {
  let response;
  const query = `SELECT * FROM competitions c
  INNER JOIN posts p ON p.competition_id=c.id
  WHERE p.id='${payload.postId}' AND c.submission_end_date > CURRENT_TIMESTAMP`;

  const competitionStatus = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  if (competitionStatus[0]) {
    response = { status: 400, error: 'competition has ended' };
    return response;
  }

  const point = await postLibrary.getPostPointData(payload.userId, payload.postId);

  // if this is the first time calculating the total point view
  if (!point) {
    const viewCount = 1;

    const totalPoint = payload.viewTime * 0.17;

    const data = {
      id: generatePushID(),
      view_count: viewCount,
      view_time: payload.viewTime,
      post_id: payload.postId,
      user_id: payload.userId,
      points: totalPoint,
    };

    try {
      await PostViewCount.create(data);
      response = await postLibrary.totalPoint(payload.postId);
      return response;
    } catch (error) {
      response = { error };
      return response;
    }
  }
  const viewCount = point.view_count + 1;
  const updatedViewTime = `${point.view_time},${payload.viewTime}`;
  const newPoint = postLibrary.calculatePostPoint(
    payload.viewTime,
    viewCount,
  );

  const sumPoint = newPoint + point.points;


  switch (point.view_count) {
    case 1:
    case 2:
    case 3:
    case 4:
      try {
        await PostViewCount.update(
          { view_count: viewCount, view_time: updatedViewTime, points: sumPoint },
          {
            where: {
              id: point.id,
            },
          },
        );
        response = await postLibrary.totalPoint(payload.postId);
      } catch (error) {
        return { error };
      }
      break;
    default:
      try {
        await PostViewCount.update(
          {
            view_count: viewCount,
            view_time: updatedViewTime,
            points: payload.viewTime >= (payload.postDuration / 2)
              ? point.points + 0.003 : point.points + 0,
          },
          {
            where: {
              id: point.id,
            },
          },
        );
        response = await postLibrary.totalPoint(payload.postId);
      } catch (error) {
        return { error };
      }

      break;
  }
  return response;
};

postLibrary.calculatePostPoint = (viewTime, viewCount) => {
  const fixedPoint = 0.17;
  const totalPoint = (viewTime / viewCount) * fixedPoint;
  return totalPoint;
};

postLibrary.getPostPointData = async (userId, postId) => {
  try {
    const point = await PostViewCount.findOne({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });
    return point;
  } catch (error) {
    return { error };
  }
};

postLibrary.delete = async (payload) => {
  let response;
  try {
    response = await Post.update(
      { deleted: 1 },
      {
        where: {
          id: payload.id,
        },
        returning: true,
        plain: true,
      },
    );
    return { status: response ? 200 : 404, message: 'Post deleted successfully' };
  } catch (error) {
    return { status: 400, error: error.message };
  }
};

postLibrary.shares = async (payload) => {
  try {
    const id = generatePushID();
    const response = await postShares.create({ ...payload, id });
    return { status: response ? 200 : 400, message: response ? 'Post Shared' : 'Error ocurred sharing a post' };
  } catch (error) {
    return { status: 400, error: error.message };
  }
};

module.exports = postLibrary;
