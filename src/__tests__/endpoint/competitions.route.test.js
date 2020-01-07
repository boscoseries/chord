const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/index');
const { User } = require('../../models/v1/users');
const payload = require('../../__tests__/testhelpers/payloadsamples');
const {
  Competitions,
  Competition_Banners
} = require('../../models/v1/competitions');

describe('Tests for Competition Routes', async () => {
  beforeEach(async () => {
    User.destroy({
      where: {}
    });
    await Competitions.destroy({ where: {} });
    await User.create(payload.signupCredAdmin);

    await Promise.all([
      Competitions.create(payload.competitionOne),
      Competitions.create(payload.competitionTwo),
      Competitions.create(payload.competitionThree),
      Competitions.create(payload.competitionFour)
    ]);

    await Competition_Banners.create(payload.competitionBanner);
  });

  afterEach(async () => {
    await Competition_Banners.destroy({ where: {} });
    await User.destroy({ where: {} });
  });
  describe('POST /api/v1/competitions/posts', () => {
    it('should create a new competition ', async () => {
      const response = await request(app)
        .post('/api/v1/competitions')
        .set('x_auth_token', payload.adminToken)
        .field('title', 'DanceHall')
        .field('description', 'This is a description')
        .field('owner_id', `${payload.competitionOne.owner_id}`)
        .field('competition_type', 'free')
        .field('criteria', 'strictly adults')
        .field('status', 'draft')
        .field('submission_start_date', `${new Date().toJSON()}`)
        .field('submission_end_date', `${new Date().toJSON()}`)
        .field('vote_start_date', `${new Date().toJSON()}`)
        .field('vote_end_date', `${new Date().toJSON()}`)
        .attach(
          'adBanner',
          path.join(__dirname, '../../', 'assets/images', 'laptop.jpeg'),
          'laptop.jpeg',
        )
        .attach(
          'banner',
          path.join(__dirname, '../..', 'assets/images', 'guitar.jpg'),
          'guitar.jpg',
        )
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body).to.haveOwnProperty('competition');
      expect(response.body).to.haveOwnProperty('bannerResponse');
      expect(response.body.competition).to.haveOwnProperty('id');
      expect(response.body.competition).to.include({
        title: 'DanceHall',
        status: 'draft',
        description: 'This is a description',
        owner_id: '-LrPpU4mkJtOoszJYUjL',
        criteria: 'strictly adults'
      });
      expect(response.body.competition.adbanner_url).to.have.string(
        'https://testurl.com/a-/someurltobeusedwhenintest'
      );
      expect(response.body.competition.adbanner_url).to.have.string(
        'someurltobeusedwhenintest'
      );
      expect(response.body.competition).to.haveOwnProperty(
        'submission_start_date'
      );
      expect(response.body.competition).to.haveOwnProperty('vote_start_date');
      expect(response.body.bannerResponse).to.haveOwnProperty('banner_url');
      expect(response.body.bannerResponse).to.haveOwnProperty('id');
      expect(response.body.bannerResponse.banner_url).to.have.string(
        'https://testurl.com/'
      );
      expect(response.body.bannerResponse.banner_url).to.have.string(
        'https://testurl.com/'
      );
    });
  });
  describe('PUT /api/v1/competitions', () => {
    it('/:id/posts should update the competition with the supplied id', async () => {
      const response = await request(app)
        .put(`/api/v1/competitions/${payload.competitionOne.id}/posts`)
        .set('x_auth_token', payload.adminToken)
        .field('title', 'Editted title')
        .field('description', 'This is an editted description')
        .field('owner_id', `${payload.signupCredOne.id}`)
        .field('competition_type', 'paid')
        .field('criteria', 'Editted criteria')
        .field('status', 'published')
        .field('submission_start_date', `${new Date().toJSON()}`)
        .field('submission_end_date', `${new Date().toJSON()}`)
        .field('vote_start_date', `${new Date().toJSON()}`)
        .field('vote_end_date', `${new Date().toJSON()}`)
        .attach(
          'adBanner',
          path.join(__dirname, '../..', 'assets/images', 'teddybear.jpg'),
          'teddybear.jpg'
        )
        .field('banner_id', `${payload.competitionBanner.id}`) // id of banner
        .attach(
          'banner',
          path.join(__dirname, '../..', 'assets/images', 'maudition_logo.png'),
          'maudition_logo.png'
        )
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('adbanner_url');
      expect(response.body).to.haveOwnProperty('status');
      expect(response.body).to.haveOwnProperty('title');
      expect(response.body).to.haveOwnProperty('criteria');
      expect(response.body).to.haveOwnProperty('competition_type');
      expect(response.body.title).to.equal('Editted title');
      expect(response.body.criteria).to.equal('Editted criteria');
    });
    it('/:id/status should update the status of the competitions with id of :id', async () => {
      const status = 'closed';
      const response = await request(app)
        .put(
          `/api/v1/competitions/${payload.competitionOne.id}/status?status=${status}`
        )
        .set('x_auth_token', payload.adminToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.message).to.equal('Status updated successfully');
      expect(response.body.newStatus).to.equal('closed');
    });
  });

  describe('GET /api/v1/competitions/posts?status=published', () => {
    it('should return all competitions with status of "published"', async () => {
      const response = await request(app)
        .get('/api/v1/competitions/posts?status=published')
        .set('x_auth_token', payload.adminToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body[0].competition).to.haveOwnProperty('id');
      expect(response.body[0].competition).to.haveOwnProperty('adbanner_url');
      expect(response.body[0].competition).to.haveOwnProperty('status');
      expect(response.body[0].competition.status).to.equal('published');
    });
    it('/posts?status=draft should return all competitions with status of "draft"', async () => {
      const response = await request(app)
        .get('/api/v1/competitions/posts?status=draft')
        .set('x_auth_token', payload.adminToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body[0].competition.status).to.equal('draft');
    });
    it('/posts?status=closed should return all competitions with status of "closed"', async () => {
      const response = await request(app)
        .get('/api/v1/competitions/posts?status=closed')
        .set('x_auth_token', payload.adminToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body[0]).to.haveOwnProperty('competition');
      expect(response.body[0].competition.status).to.equal('closed');
      expect(response.body[0].competition).to.haveOwnProperty('id');
      expect(response.body[0].competition).to.haveOwnProperty('adbanner_url');
      expect(response.body[0].competition).to.haveOwnProperty(
        'competition_type'
      );
    });
    it('/:id/posts should return the competitions with id of :id', async () => {
      const response = await request(app)
        .get(`/api/v1/competitions/${payload.competitionTwo.id}/posts`)
        .set('x_auth_token', payload.adminToken)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.have.property('competition');
      expect(response.body).to.have.property('judges');
      expect(response.body).to.have.property('competitionFeed');
      expect(response.body).to.have.property('total_posts_count');
      expect(response.body.competition).to.have.property('competition_banners');
      expect(response.body.competition).to.have.property(
        'id',
        payload.competitionTwo.id
      );
      expect(response.body.competition)
        .to.have.property('adbanner_url')
        .that.is.a('string');
      expect(response.body.competition)
        .to.have.property('fee')
        .that.is.a('number');
    });
  });
});
