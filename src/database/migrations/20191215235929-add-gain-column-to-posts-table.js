module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => [
    await queryInterface.addColumn('posts', 'previous_points', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    }),
    await queryInterface.addColumn('posts', 'gains', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    }),
  ],
  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => [
    await queryInterface.removeColumn('posts', 'previous_points'),
    await queryInterface.removeColumn('posts', 'gains'),
  ],
};
