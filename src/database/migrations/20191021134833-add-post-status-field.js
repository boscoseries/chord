module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.addColumn('posts', 'deleted', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }),

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts', 'deleted'),
};
