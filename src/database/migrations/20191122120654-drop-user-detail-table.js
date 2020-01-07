module.exports = {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.dropTable('user_details'),
  down: (queryInterface, Sequelize) => queryInterface.createTable('user_details', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    height: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    date_of_birth: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    eye_colour: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    skin_colour: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    biography: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    website: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    address: {
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
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'competitions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }),
};
