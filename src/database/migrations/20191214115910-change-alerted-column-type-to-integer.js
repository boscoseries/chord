module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.changeColumn('competitions', 'alerted', {
    type: 'INTEGER USING CAST("alerted" as INTEGER)',
    defaultValue: 0,
    allowNull: true,
  }),
};
