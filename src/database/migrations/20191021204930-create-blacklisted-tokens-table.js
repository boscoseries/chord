module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('blacklisted_tokens', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
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
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
   
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

  }),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => queryInterface.dropTable('blacklisted_tokens'),
};


