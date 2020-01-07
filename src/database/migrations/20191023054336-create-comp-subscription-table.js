module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('competition_subscriptions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING,
    },
    user_id: {
      type: Sequelize.STRING,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
    competition_id: {
      type: Sequelize.STRING,
      references: {
        model: 'competitions',
        key: 'id',
      },
      allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    subscribed: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('competition_subscriptions'),
};
