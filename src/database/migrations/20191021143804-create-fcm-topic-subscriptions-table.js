module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('fcm_topic_subscriptions', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    device_token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fcm_topic: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('fcm_topic_subscriptions'),
};


