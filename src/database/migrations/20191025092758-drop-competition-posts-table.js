module.exports = {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.dropTable('competition_posts'),
  down: (queryInterface, Sequelize) => queryInterface.createTable('competition_posts', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    competition_id: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'competitions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    post_id: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }),
};
