module.exports = (sequelize, type) => sequelize.define('hashtagposts', {
  id: {
    type: type.STRING,
    primaryKey: true,
    allowNull: false,
  },
  hashtag_id: {
    type: type.STRING,
    allowNull: false,
  },
  post_id: {
    type: type.STRING,
    allowNull: false,
  },
});
