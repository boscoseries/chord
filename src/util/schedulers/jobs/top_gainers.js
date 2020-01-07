/* eslint-disable no-multiple-empty-lines */
const debug = require('debug');
const { sequelize } = require('../../../database-config/connection');
const notificationLibrary = require('../../../libs/v1/notifications');
const postLibrary = require('../../../libs/v1/posts');

// eslint-disable-next-line no-unused-vars
const log = debug('http:cron-jobs');

const updateGainsTable = async (postId) => {
  const totalPoints = await postLibrary.totalPoint(postId);
  const updateQuery = `UPDATE posts
SET gains = ('${totalPoints}' - previous_points), previous_points = '${totalPoints}',
updated_at = CURRENT_TIMESTAMP
WHERE posts.id = '${postId}'
`;
  await sequelize.query(updateQuery, {
    type: sequelize.QueryTypes.SELECT,
  });
};

const notifyGainers = async (detail) => {
  const notificationData = {
    competition_id: detail.competition_id,
    action: 'top_gainers',
    competition_title: detail.title,
    avatar: detail.avatar,
  };
  const notificationObject = {
    data: notificationData,
    title: 'top gainers',
    message_body: `New top gainers have emerged in ${detail.title}`,
    token: detail.device_token,
    receiverId: detail.user_id,
    notification_type: notificationData.action,
  };
  if (process.env.NODE_ENV !== 'test') {
    await notificationLibrary.sendFCMNotification(notificationObject);
  }
};

const topGainers = async () => {
  const query = `SELECT posts.id AS post_id, posts.user_id AS user_id, competition_id, competitions.title, device_token_registrations.device_token, avatar FROM posts
LEFT JOIN device_token_registrations ON posts.user_id = device_token_registrations.user_id
INNER JOIN users ON posts.user_id = users.id
INNER JOIN competitions ON competitions.id = posts.competition_id
WHERE competition_id IN (SELECT id FROM competitions
WHERE vote_start_date < CURRENT_TIMESTAMP
AND vote_end_date > CURRENT_TIMESTAMP)`;

  const postDetails = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  postDetails.map(async (postDetail) => {
    updateGainsTable(postDetail.post_id);
    notifyGainers(postDetail);
  });
};

module.exports = { topGainers };
