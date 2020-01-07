module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert({ tableName: 'permissions' }, [{
    id: '-LkfrXss8__3l-lcDHHb',
    permission: 'VIEW_PROFILE_DETAILS',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LkfraT6i6CGzy_0d2sU',
    permission: 'CREATE_USER',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-Lkfrc_egOO5di0X6cMQ',
    permission: 'CREATE_YESVOTE',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-Lkfrel-zbVQS5VbOwdv',
    permission: 'CREATE_NOVOTE',
    created_at: new Date(),
    updated_at: new Date(),
  }], {}),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete({ tableName: 'permissions' }, null, { });
  },
};
