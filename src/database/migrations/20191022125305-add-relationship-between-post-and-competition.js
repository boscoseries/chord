module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.addColumn('posts', 'competition_id', {
    type: Sequelize.STRING,
    allowNull: true,
    references: {
      model: 'competitions',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }),

  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('posts', 'competition_id'),
};
