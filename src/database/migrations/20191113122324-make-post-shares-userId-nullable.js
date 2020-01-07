module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('post_shares', 'user_id', {
    type: Sequelize.STRING,
    allowNull: true,
  }),
};
