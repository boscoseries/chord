const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../../index');
const payload = require('../../../testhelpers/payloadsamples');
const { User } = require('../../../../models/v1/users');
const library = require('../../../../libs/v1/users');

describe('Users Endpoints', () => {
  describe('user library to get all users', () => {
    beforeEach((done) => {
      User.destroy({
        where: {},
      });
      const authId = 'mattadesanya@gmail.com';
      const id = '-LmnoGawGnWS36fW-ghX';

      const data = {
        id,
        auth_id: authId,
        auth_type: 'email',
        role_id: 'talent',
      };

      User.create(data).then(() => done());
    });

    afterEach((done) => {
      User.destroy({
        where: {
          id: '-LmnoGawGnWS36fW-ghX',
        },
      }).then(() => done());
    });
    it('should get record of all users', (done) => {
      library
        .getAll()
        .then((users) => {
          expect(users[0].auth_id).to.equal('mattadesanya@gmail.com');
          expect(users[0].auth_type).to.equal('email');
          expect(users[0].role_id).to.equal('talent');
          done();
        })
        .catch(done);
    });
  });
});
