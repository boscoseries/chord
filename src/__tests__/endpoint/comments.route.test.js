const request = require('supertest');
const { expect } = require('chai');
const { User } = require('../../models/v1/users');
const { Post } = require('../../models/v1/posts');
const { Comment } = require('../../models/v1/comments');
const helper = require('../../util/helper');
const Category = require('../../models/v1/categories');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');

describe('COMMENT ENDPOINTS', () => {
  before(async () => {
    await User.create(payload.signupCredOne);
    await Category.create({
      id: '-LrZatIh_IHoPdh3b6Ug',
      name: 'singing',
    });
    // add post category....
    payload.postOne.category_id = '-LrZatIh_IHoPdh3b6Ug';
    await Post.create(payload.postOne);
    await Comment.create(payload.comment);
  });

  after(async () => {
    await Promise.all([
      User.destroy({ where: {} }),
      Post.destroy({ where: {} }),
      Comment.destroy({ where: {} }),
      Category.destroy({ where: {} }),
    ]);
  });

  describe('CREATE COMMENT /api/v1/comments', () => {
    it('should allow a user comment on a post', async () => {
      const response = await request(app)
        .post('/api/v1/comments')
        .set('x_auth_token', payload.token)
        .send(payload.comment)
        .expect(201);

      expect(response.body).to.haveOwnProperty('avatar');
      expect(response.body).to.haveOwnProperty('fullname');
      expect(response.body).to.haveOwnProperty('username');
      expect(response.body).to.haveOwnProperty('post_id');
      expect(response.body).to.haveOwnProperty('user_id');
      expect(response.body).to.haveOwnProperty('comment');
    });
    it('should return 404 when comment if incorrect parameters are sent', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('x_auth_token', payload.token)
        .send({
          comment: 222222,
          post_id: payload.postOne.id,
          user_id: payload.signupCredOne.id,
        })
        .expect(400);
    });
  });
  describe('GET /ap1/v1/comments', () => {
    it('should allow a user get comments', async () => {
      const response = await request(app)
        .get('/api/v1/comments')
        .set('x_auth_token', payload.token)
        .expect(200);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('post_id');
      expect(response.body[0]).to.haveOwnProperty('comment');
      expect(response.body[0]).to.haveOwnProperty('user_id');
    });
  });
});
