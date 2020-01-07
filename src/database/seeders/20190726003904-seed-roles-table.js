module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert({ tableName: 'roles' }, [{
    id: 'talent',
    role: 'talent',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: 'scout',
    role: 'scout',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: 'judge',
    role: 'judge',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: 'admin',
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date(),
  }], {}),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete({ tableName: 'roles' }, null, {
    });
  },
};
