const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');
const { User } = require('../../models/v1/users');
const { Post } = require('../../models/v1/posts');
const { Like } = require('../../models/v1/likes');
const { PostViewCount } = require('../../models/v1/posts');
const TokenAuth = require('../../models/v1/token_auth');
const Category = require('../../models/v1/categories');

describe('POSTS Endpoints', () => {
  before(async () => {
    await User.create(payload.signupCredOne);
    await User.create(payload.signupCredTwo);

    await Category.create({
      id: '-LrZatIh_IHoPdh3b6Ug',
      name: 'singing',
    });

    payload.postOne.category_id = '-LrZatIh_IHoPdh3b6Ug';
    payload.postTwo.category_id = '-LrZatIh_IHoPdh3b6Ug';
    await Post.create(payload.postOne);
    await Post.create(payload.postTwo);
  });

  after(async () => {
    await Promise.all([
      User.destroy({ where: {} }),
      Post.destroy({ where: {} }),
      Like.destroy({ where: {} }),
      PostViewCount.destroy({ where: {} }),
      TokenAuth.destroy({ where: {} }),
      Category.destroy({ where: {} }),
    ]);
  });

  describe('CREATE POSTS  /api/v1/posts/newpost', () => {
    it('should not allow a user who is not logged in create a post', async () => {
      const response = await request(app)
        .post('/api/v1/posts/newpost')
        .expect(401);
      expect(response.body).to.haveOwnProperty('message');
      expect(response.body.message).to.equal('Please login');
    });

    it('should allow logged-in users create posts', async () => {
      const response = await request(app)
        .post('/api/v1/posts/newpost')
        .set('x_auth_token', payload.token)
        .set('user_id', '-LmnoGawGnWS36fW-ghX')
        .set('Content-Type', 'multipart/form-data')
        .field('user_id', payload.signupCredOne.id)
        .field('id', '-LrORb1_KI8Cnyed1A3z')
        .field('caption', 'some awesome title for my post')
        .field('post_duration', 34)
        .field('hashtag', `${['someawesometag', 'anothersawesome']}`)
        .field('category_id', '-LrZatIh_IHoPdh3b6Ug')
        .attach(
          'media_url',
          path.join(__dirname, '../../', 'assets/images', 'testImage.png'),
          'testImage.png',
        )
        .attach(
          'thumbnail_url',
          path.join(__dirname, '../../', 'assets/images', 'testImage.png'),
          'testImage.png',
        )
        .expect(201);
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('category_id');
      expect(response.body).to.haveOwnProperty('title');
      expect(response.body).to.haveOwnProperty('media_url');
      expect(response.body).to.haveOwnProperty('post_duration');
      expect(response.body).to.haveOwnProperty('user_info');
      expect(response.body.user_info).to.haveOwnProperty('user_id');
    });
  });
  describe('PERSONALIZED NEWSFEED /api/v1/posts/newsfeed', () => {
    it('should return personalized feeds', async () => {
      // create a Follower... make userOne follow userTwo...
      // this gives userOne access to post made by userTwo
      await request(app)
        .post('/api/v1/users/follows')
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredTwo.id,
          follower_id: payload.signupCredOne.id,
        })
        .set('x_auth_token', payload.token)
        .set('fcm_token', 'someverylongstring');

      const response = await request(app)
        .get('/api/v1/posts/newsfeed/personalized')
        .set('x_auth_token', payload.token)
        .set('user_id', payload.signupCredOne.id);

      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('category_id');
      expect(response.body[0]).to.haveOwnProperty('title');
      expect(response.body[0].title).to.equal('post two');
      expect(response.body[0]).to.haveOwnProperty('comments');
      expect(response.body[0]).to.haveOwnProperty('comment_count');
      expect(response.body[0]).to.haveOwnProperty('hashtags');
    });
  });
  describe('GET POSTS NEWSFEED /api/v1/posts/newsfeed', () => {
    it('should return the lists of all posts', async () => {
      const response = await request(app)
        .get('/api/v1/posts/newsfeed')
        .expect(200);
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('title');
      expect(response.body[0]).to.haveOwnProperty('media_url');
      expect(response.body[0]).to.haveOwnProperty('user_info');
      expect(response.body[0]).to.haveOwnProperty('comments');
      expect(response.body[0]).to.haveOwnProperty('post_shares_count');
      expect(response.body[0].user_info).to.haveOwnProperty('user_id');
      expect(response.body[0].user_info).to.haveOwnProperty('username');
    });
  });
  describe('LIKES', () => {
    it('should allow a user like a posts', async () => {
      const response = await request(app)
        .post('/api/v1/posts/likes')
        .set('x_auth_token', payload.token)
        .set('fcm_token', 'device-token')
        .send({
          post_id: payload.postOne.id,
          user_id: payload.signupCredOne.id,
        })
        .expect(200);
      expect(response.body).to.equal('like');
    });
    it('should allow a user unlike a posts', async () => {
      const response = await request(app)
        .post('/api/v1/posts/likes')
        .set('x_auth_token', payload.token)
        .set('fcm_token', 'device-token')
        .send({
          post_id: payload.postOne.id,
          user_id: payload.signupCredOne.id,
        })
        .expect(200);
      expect(response.body).to.equal('unlike');
    });
  });
  describe('BOOKMARK', () => {
    it('should allow a user bookmark a post', async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${payload.postOne.id}/bookmarks`)
        .set('user_id', payload.signupCredOne.id)
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredOne.id,
          post_id: payload.postOne.id,
        })
        .expect(200);

      expect(response.body).to.haveOwnProperty('post_id');
      expect(response.body).to.haveOwnProperty('user_id');
      expect(response.body).to.haveOwnProperty('status');
      expect(response.body.status).to.equal(1);
    });
    it('should return the users bookmarked post', async () => {
      const response = await request(app)
        .get('/api/v1/posts/bookmarks')
        .set('userId', payload.signupCredOne.id)
        .set('x_auth_token', payload.token);
      expect(response.body[0]).to.haveOwnProperty('title');
      expect(response.body[0]).to.haveOwnProperty('media_url');
      expect(response.body[0]).to.haveOwnProperty('thumbnail_url');
      expect(response.body[0]).to.haveOwnProperty('bookmark_status');
      expect(response.body[0].bookmark_status).to.equal(1);
    });
    it('should allow a user remove bookmark from a post', async () => {

      const response = await request(app)
        .post(`/api/v1/posts/${payload.postOne.id}/bookmarks`)
        .set('user_id', payload.signupCredOne.id)
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredOne.id,
          post_id: payload.postOne.id,
        })
        .expect(200);
      expect(response.body.status).to.equal(0);
    });
    
  });
  describe('VIEW POINT /api/v1/posts/:id/points', () => {
    it('should allow return the points based on views', async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${payload.postOne.id}/points`)
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredOne.id,
          view_time: 20,
          post_duration: 34,
        })
        .expect(200);
      expect(response.body).to.haveOwnProperty('post point');
    });
  });
  describe('PERSIST SHARED POST COUNTER /api/v1/posts/:id/shares', () => {
    it('should allow return the points based on views', async () => {
      const channel = 'social_media_channel';
      const response = await request(app)
        .post(`/api/v1/posts/${payload.postOne.id}/shares`)
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredOne.id,
          [channel]: 'whatsapp',
        })
        .expect(200);
      expect(response.body.message).to.equal('Post Shared');
    });
  });
});
