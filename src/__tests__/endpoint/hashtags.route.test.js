const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');
const { User } = require('../../models/v1/users');
const { Hashtag } = require('../../models/v1/hashtags');
const { Post } = require('../../models/v1/posts');
const helper = require('../../util/helper');
const Category = require('../../models/v1/categories');

describe('HASHTAGS ENDPOINTS', () => {
  before(async () => {
    await User.create(payload.signupCredOne);
    await Hashtag.create({
      id: '-LrYohSc7J-40AaXVvoz',
      name: 'singing',
    });
    await Hashtag.create({
      id: '-LrYohSc7J-40AaXVvp',
      name: 'dancing',
    });
    await Hashtag.create({
      id: '-LrYohSc7J-40AaXVvp0',
      name: 'comedy',
    });

    await Category.create({
      id: '-LrZatIh_IHoPdh3b6Ug',
      name: 'singing',
    });

    payload.postOne.category_id = '-LrZatIh_IHoPdh3b6Ug';
    await Post.create(payload.postOne);
    await helper.processHashtag(`${['singing', 'dancing']}`, payload.postOne.id);
  });

  after(async () => {
    Hashtag.destroy({
      where: {},
    });
    User.destroy({
      where: {},
    });
    Post.destroy({
      where: {},
    });
    Category.destroy({
      where: {},
    });
  });

  describe('CREATE HASHTAG /api/v1/hashtags', () => {
    it('should create a hashtag', async () => {
      const response = await request(app)
        .post('/api/v1/hashtags')
        .set('x_auth_token', payload.token)
        .send({
          name: 'someawesomehastag',
        });
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('name');
      expect(response.body.name).to.equal('someawesomehastag');
    });
  });

  describe('GET ALL HASHTAGS', () => {
    it('should return all hastags and post for hashtag', async () => {
      const response = await request(app).get('/api/v1/hashtags/posts')
        .set('x_auth_token', payload.token);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('name');
      expect(response.body[0]).to.haveOwnProperty('posts');
      expect(response.body[0].posts[0]).to.haveOwnProperty('category_id');
      expect(response.body[0].posts[0]).to.haveOwnProperty('title');
      expect(response.body[0].posts[0]).to.haveOwnProperty('media_url');
      expect(response.body[0].posts[0]).to.haveOwnProperty('post_duration');
      expect(response.body[0].posts[0]).to.haveOwnProperty('user_info');
    });
  });
  describe('GET A SINGLE HASHTAG', () => {
    it('should return that hashtag and all subposts', async () => {
      const response = await request(app).get(`/api/v1/hashtags/${'-LrYohSc7J-40AaXVvoz'}/posts`)
        .set('x_auth_token', payload.token);
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('name');
      expect(response.body).to.haveOwnProperty('posts');
      expect(response.body.posts[0]).to.haveOwnProperty('id');
      expect(response.body.posts[0]).to.haveOwnProperty('title');
      expect(response.body.posts[0]).to.haveOwnProperty('post_duration');
      expect(response.body.posts[0]).to.haveOwnProperty('media_url');
      expect(response.body.posts[0]).to.haveOwnProperty('thumbnail_url');
    });
  });
});
