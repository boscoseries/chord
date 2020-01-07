module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => queryInterface.bulkInsert({ tableName: 'role_permissions' }, [{
    id: '-LkfsSjftzTK6H7LS4FL',
    permission_id: '-LkfrXss8__3l-lcDHHb',
    role_id: 'scout',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LkfsyJNCBrCe1AtX4O7',
    permission_id: '-LkfraT6i6CGzy_0d2sU',
    role_id: 'admin',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-Lkft9hQVZ6jpD30AEdn',
    permission_id: '-Lkfrc_egOO5di0X6cMQ',
    role_id: 'judge',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LkftHQMdoUQGwiUTTvX',
    permission_id: '-Lkfrel-zbVQS5VbOwdv',
    role_id: 'judge',
    created_at: new Date(),
    updated_at: new Date(),
  }], {}),
  // eslint-disable-next-line no-unused-vars
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role_permissions', null, {});
  },
};
