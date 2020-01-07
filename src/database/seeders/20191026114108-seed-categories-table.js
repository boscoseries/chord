module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert({ tableName: 'categories' }, [{
    id: '-LizVN0Q78c8dm_OSSeG',
    name: 'Football',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LizVPxLD6svz3gjRZ-t',
    name: 'Tennis',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LizVSGdVzw-TQ_67I1G',
    name: 'Althletics',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LizVVat7riy6B2vYcUQ',
    name: 'Music',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LizVX8FrWTbL8gZJeRy',
    name: 'Drama',
    created_at: new Date(),
    updated_at: new Date(),
  }, {
    id: '-LizVZ-eiyFr-L4HkmUM',
    name: 'Comedy',
    created_at: new Date(),
    updated_at: new Date(),
  }], {}),

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  },
};
