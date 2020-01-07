const debug = require('debug');
const { Comment, validateComment } = require('../../models/v1/comments');
const { sequelize } = require('../../database-config/connection');
const generatePushID = require('../../util/pushid');
const { User } = require('../../models/v1/users');
const libraryHelper = require('../../util/library_helper');
const libHelper = require('../../util/library_helper');
const { Post } = require('../../models/v1/posts');

const log = debug('http:comment');

const commentLibrary = {};

commentLibrary.get = async (req, res) => {
  await Comment.findAll()
    .then(comments => res.status(200).json(comments))
    .catch(error => res.status(500).json(error));
};

const sendFCMNotification = async (notificationObject) => {
  const message = {
    notification: {
      title: notificationObject.title,
      body: notificationObject.message_body,
    },
    token: notificationObject.token,
    data: notificationObject.data,
    receiverId: notificationObject.receiverId,
  };
  libHelper.sendFCMNotification(message, notificationObject.notification_type);
};

const sendNotification = async (comment, deviceToken) => {
  const title = 'mAudition';
  const user = await libraryHelper.getUserDetailsFromPostID(comment.post_id);
  const post = await Post.findOne({
    where: {
      id: comment.post_id,
    },
  });
  const commenter = await User.findOne({
    where: {
      id: comment.user_id,
    },
  });

  const totalComment = await Comment.count({
    where: {
      post_id: post.id,
    },
  });
  const message = `${commenter.username} commented on your post`;
  const newDeviceToken = user.device_token;

  const notificationData = {
    post_id: comment.post_id,
    comment: comment.comment,
    comment_id: comment.id,
    time: comment.createdAt,
    totalNoOfComment: totalComment,
    user_id: commenter.id,
    user_avatar: commenter.avatar,
    username: commenter.username,
    post_thumbnail: post.thumbnail_url,
    action: 'comment',
  };

  const notificationObject = {
    title,
    token: newDeviceToken,
    message_body: message,
    data: notificationData,
    receiverId: user.id,
    notification_type: 'comment',
  };
  sendFCMNotification(notificationObject);
};

commentLibrary.create = async (req, res) => {
  const deviceToken = req.headers.device_token;
  const { error } = validateComment(req.body);
  if (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }

  const data = {
    id: generatePushID(),
    comment: req.body.comment,
    post_id: req.body.post_id,
    user_id: req.body.user_id,
  };
  Comment.create(data)
    .then(async (comment) => {
      const user = await User.findOne({
        where: {
          id: req.body.user_id,
        },
        attributes: ['avatar', 'fullname', 'username'],
      });
      const response = { ...user.dataValues, ...comment.dataValues };
      sendNotification(comment, deviceToken);
      return res.status(201).json(response);
    })
    .catch(errors => res.status(500).json({ message: 'Some error occured', error: errors.message }));
};

commentLibrary.getComments = async (id) => {
  const qry = `SELECT comments.id, comments.comment, comments.created_at, users.id AS commenter_id,
    users.avatar AS commenter_avatar, users.username AS commenter_name
    FROM comments INNER JOIN users ON comments.user_id=users.id
    WHERE comments.post_id= '${id}' ORDER BY comments.updated_at DESC`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  return results;
};

module.exports = commentLibrary;
