module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.addColumn('competitions', 'alerted', {
    type: Sequelize.STRING,
    defaultValue: 0,
    allowNull: true,
  }),

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('competitions', 'alerted'),
};
