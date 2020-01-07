module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('users', {
      id: {
        type: Sequelize.STRING,
        allowNull: true,
        primaryKey: true,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      auth_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      auth_type: {
        type: Sequelize.ENUM('phone', 'email', 'facebook', 'google'),
      },
      role_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    }),
    // eslint-disable-next-line no-unused-vars
    down: (queryInterface, Sequelize) => queryInterface.dropTable('users'),
  };
  
  