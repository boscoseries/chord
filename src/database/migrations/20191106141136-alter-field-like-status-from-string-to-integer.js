module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('likes', 'status', {
    type: 'INTEGER USING CAST("status" as INTEGER)',
  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('likes'),
};
