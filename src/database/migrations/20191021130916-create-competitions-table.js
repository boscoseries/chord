module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('competitions', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    adbanner_url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    criteria: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    competition_type: {
      type: Sequelize.ENUM('paid', 'free'),
    },
    fee: {
      type: Sequelize.DOUBLE,
      allowNull: true,
    },
    submission_start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    submission_end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    vote_start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    vote_end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    owner_id: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('competitions'),
};

