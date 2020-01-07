module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => [
    await queryInterface.addColumn('post_view_counts', 'previous_points', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    }),
    await queryInterface.addColumn('post_view_counts', 'gains', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    }),
  ],
  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => [
    await queryInterface.removeColumn('post_view_counts', 'previous_points'),
    await queryInterface.removeColumn('post_view_counts', 'gains'),
  ],
};
