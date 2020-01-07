

module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => [
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'date_of_birth', {
      type: Sequelize.DATE,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'height', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'eye_color', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'skin_color', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'biography', {
      type: Sequelize.TEXT,
      max: 300,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'website', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
  ],
  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => [
    await queryInterface.removeColumn('users', 'email'),
    await queryInterface.removeColumn('users', 'phone_number'),
    await queryInterface.removeColumn('users', 'gender'),
    await queryInterface.removeColumn('users', 'height'),
    await queryInterface.removeColumn('users', 'eye_color'),
    await queryInterface.removeColumn('users', 'skin_color'),
    await queryInterface.removeColumn('users', 'biography'),
    await queryInterface.removeColumn('users', 'website'),
    await queryInterface.removeColumn('users', 'address'),
  ],
};
