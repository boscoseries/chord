module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('fcm_notification_messages', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
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
    notification_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    notification_message: {
      type: Sequelize.JSON,
      allowNull: true,
    },
  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('fcm_notification_messages'),
};


