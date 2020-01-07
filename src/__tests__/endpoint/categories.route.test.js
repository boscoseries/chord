const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');
const Category = require('../../models/v1/categories');
const { Hashtag, HashtagPosts } = require('../../models/v1/hashtags');
const { Post } = require('../../models/v1/posts');
const { User } = require('../../models/v1/users');

describe('CATEGORIES ENDPOINTS', () => {
  before(async () => {
    await User.create(payload.signupCredOne);
    await User.create(payload.signupCredTwo);

    await Category.create({
      id: '-LrZatIh_IHoPdh3b6Ug',
      name: 'singing',
    });
    await Category.create({
      id: '-LrdgeeF7fWFaA-rAcb2',
      name: 'dancing',
    });

    payload.postOne.category_id = '-LrZatIh_IHoPdh3b6Ug';
    payload.postTwo.category_id = '-LrdgeeF7fWFaA-rAcb2';

    await Post.create(payload.postOne);
    await Post.create(payload.postTwo);
  });

  after(async () => {
    Category.destroy({
      where: {},
    });
    Hashtag.destroy({
      where: {},
    });
    HashtagPosts.destroy({
      where: {},
    });
    await Post.destroy({
      where: {},
    });
    User.destroy({
      where: {},
    });
    delete payload.postOne.category_id;
    delete payload.postTwo.category_id;
  });
  describe('CREATE CATEGORY /api/v1/categories', () => {
    it('should be able to create a category', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('x_auth_token', payload.token)
        .send({
          name: 'dancing',
        })
        .expect(201);
      expect(response.body).to.haveOwnProperty('name');
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('name');
    });
  });

  describe('GET POST IN A CATEGORY /api/v1/categories/:id/posts', () => {
    it('should return all post in a particular category', async () => {
      const response = await request(app).get(`/api/v1/categories/${'-LrZatIh_IHoPdh3b6Ug'}/posts`)
        .set('x_auth_token', payload.token);
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('name');
      expect(response.body).to.haveOwnProperty('totalPostCount');
      expect(response.body).to.haveOwnProperty('posts');
      expect(response.body.posts[0]).to.haveOwnProperty('id');
      expect(response.body.posts[0]).to.haveOwnProperty('category_id');
      expect(response.body.posts[0]).to.haveOwnProperty('media_url');
      expect(response.body.posts[0]).to.haveOwnProperty('thumbnail_url');
    });
  });

  describe('GET ALL CATEGORIES/POSTS /api/v1/categories/posts', () => {
    it('should return all categories and post in those categories', async () => {
      const response = await request(app).get('/api/v1/categories/posts')
        .set('x_auth_token', payload.token);
      expect(response.body.length).to.equal(2);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('totalPostCount');
      expect(response.body[0]).to.haveOwnProperty('posts');
      expect(response.body[0].posts[0]).to.haveOwnProperty('id');
      expect(response.body[0].posts[0]).to.haveOwnProperty('category_id');
      expect(response.body[0].posts[0]).to.haveOwnProperty('title');
    });
  });
  describe('GET /api/v1/categories', () => {
    it('should return a list of all categories', async () => {
      const response = await request(app).get('/api/v1/categories')
        .set('x_auth_token', payload.token);
      expect(response.body.length).to.equal(3);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('name');
    });
  });
});
