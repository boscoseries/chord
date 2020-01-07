module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => queryInterface.addColumn('competitions', 'update_interval', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 4,
  }),
  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => [
    await queryInterface.removeColumn('competitions', 'update_interval'),
  ],
};
