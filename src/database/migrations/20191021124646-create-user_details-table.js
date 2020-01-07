module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('user_details', {
    id: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    height: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    date_of_birth: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    eye_color: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skin_color: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    biography: {
      type: Sequelize.STRING,
      allowNull: true
    },
    website: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    address: {
      allowNull: true,
      type: Sequelize.STRING,
    },

    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('user_details'),
};

