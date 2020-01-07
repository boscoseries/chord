const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');
const payload = require('../testhelpers/payloadsamples');
const { User } = require('../../models/v1/users');
const { hashpassword } = require('../../util/helper');
const TokenAuth = require('../../models/v1/token_auth');
const UserDetails = require('../../models/v1/user-details');

describe('Users Endpoints', () => {
  before(async () => {
    const password = await hashpassword('Password123');
    payload.signupCredOne.password = password;
    User.create(payload.signupCredOne);
    User.create(payload.signupCredTwo);
  });

  after(async () => {
    await Promise.all([
      User.destroy({ where: {} }),
      TokenAuth.destroy({ where: {} }),
    ]);
  });

  describe('GET /api/v1/users', () => {
    it('should get record of all users', (done) => {
      request(app)
        .get('/api/v1/users')
        .set('x_auth_token', payload.token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });

  describe('POST /api/v1/users/signup', () => {
    it('should respond with 201 created', (done) => {
      request(app)
        .post('/api/v1/users/signup')
        .send(payload.signupCred)
        .set('Accept', 'application/json')
        .set('fcm_token', 'accordingtomr_dyouaresupposedtobeaverylongstring')
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err) => {
          done();
        });
    });

    it('should respond with 400, when incorrect details are suplied', async () => {
      delete payload.signupCredOne.username;
      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(payload.signupCred)
        .set('Accept', 'application/json')
        .set('fcm_token', 'accordingtomr_dyouaresupposedtobeaverylongstring')
        .expect('Content-Type', /json/)
        .expect(400);
      expect(response.body).to.equal('Please restart registration');
    });
  });
  describe('SIGN IN /api/v1/users/signin', () => {
    it('a registered user should be able to login', async () => {
      const userSignIn = await request(app)
        .post('/api/v1/users/signin')
        .send(payload.signinCred)
        .set('Accept', 'application/json')
        .set('fcm_token', 'accordingtomr_dyouaresupposedtobeaverylongstring')
        .expect(200);

      expect(userSignIn).to.be.a('object');
      expect(userSignIn.body).to.include({ role_id: 'talent' });
    });

    it('should not allow login with the wrong password', async () => {
      const userSignIn = await request(app)
        .post('/api/v1/users/signin')
        .send({ auth_id: 'mattadesanya@gmail.com', password: 'wrongpassword' })
        .set('Accept', 'application/json')
        .set('fcm_token', 'accordingtomr_dyouaresupposedtobeaverylongstring')
        .expect(401);

      expect(userSignIn).to.be.a('object');
      expect(userSignIn.body).to.include({ error: 'Invalid username or password' });
    });
  });

  describe('SIGN OUT /api/v1/users/signout', () => {
    it('A user should be able to signout', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${payload.signupCredOne.id}/signout`)
        .set('user_id', payload.signupCredOne.id)
        .set('x_auth_token', payload.token)
        .set('device_token', 'accordingtomr_dyouaresupposedtobeaverylongstring')
        .expect(200);

      expect(response.body).to.haveOwnProperty('status');
      expect(response.body).to.haveOwnProperty('message');
      expect(response.body.message).to.equal('Successfully signed out');
    });
    it('should return unauthoriezed if the right parameters are not supplied', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${'somerandomid'}/signout`)
        .expect(404);
      expect(response.body).to.haveOwnProperty('error');
      expect(response.body.error).to.equal('User not found');
    });
  });

  describe('SOCIAL MEDIA SIGN UP /api/v1/users/social-media', () => {
    it('A user should be able to signup from any social media platform', async () => {
      const response = await request(app)
        .post('/api/v1/users/social-media')
        .send(payload.signupCredOne)
        .expect(200);
      expect(response.body).to.haveOwnProperty('token');
      expect(response.body).to.haveOwnProperty('id');
      expect(response.body).to.haveOwnProperty('role_id');
    });

    it('should not allow a user with incomplete details signup', async () => {
      const userInfo = {
        username: 'johndoe',
        fullname: 'John Doe',
      };
      await request(app)
        .post('/api/v1/users/social-media')
        .send(userInfo)
        .expect(404);
    });
  });
  describe('OTP /api/v1/users/otp', () => {
    it('should send otp to a new user on signup', async () => {
      await request(app)
        .post(`/api/v1/users/otp?auth_id=${'rukeeojigbo@gmail.com'}&auth_type=${'email'}`)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('ok');
    });

    it('should not send otp to a user that already exists', async () => {
      const response = await request(app)
        .post(`/api/v1/users/otp?auth_id=${'mattadesanya@gmail.com'}&auth_type=${'email'}`)
        .expect(409);
      expect(response.body).to.include({ error: 'mattadesanya@gmail.com already exist' });
      expect(response.body).to.haveOwnProperty('error');
    });
  });

  // still have to validate otp...
  describe('GET USER BY ID /api/v1/users/id', () => {
    it('should be able to find user by id', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${payload.signupCredOne.id}`)
        .set('x_auth_token', payload.token)
        .expect(200);
      expect(response.body.details).to.haveOwnProperty('auth_type');
      expect(response.body.details).to.haveOwnProperty('role_id');
      expect(response.body.details).to.haveOwnProperty('phone_number');
    });

    it("should return 404 for a user who doesn't exist", async () => {
      const response = await request(app)
        .get(`/api/v1/users/${'another id'}`)
        .expect(404);
      expect(response.body).to.haveOwnProperty('message');
      expect(response.body.message).to.equal('user not found');
    });
  });

  describe('UDATE USER /api/v1/users/id', () => {
    it('should return the updated user profile', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${payload.signupCredOne.id}`)
        .set('x_auth_token', payload.token)
        .send({
          username: 'Edited UserName',
          fullname: 'Edited fullName',
          avatar: 'Edited avatarString',
          email: 'edited@gmail.com',
          phone_number: 'string',
          gender: 'Hermaphrodite',
          height: 0,
          date_of_birth: '2019-10-09',
          eye_colour: 'greenishblue',
          skin_colour: 'black',
          biography: 'A son in the east',
          website: 'www.myeditedwebsite.com',
          address: 'myeditedaddress',
        })
        .expect(200);
      expect(response.body.fullname).to.equal('Edited fullName');
      expect(response.body.email).to.equal('edited@gmail.com');
    });

    it('should return an error message if the wrong id is passed in', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${'somewrongid'}`)
        .set('x_auth_token', payload.token)
        .send({
          username: 'Edited UserName',
          fullname: 'Edited fullName',
          avatar: 'Edited avatarString',
          email: 'edited@gmail.com',
          phone_number: 'string',
          gender: 'Hermaphrodite',
          height: 0,
          date_of_birth: '2019-10-09',
          eye_colour: 'greenishblue',
          skin_colour: 'black',
          biography: 'A son in the east',
          website: 'www.myeditedwebsite.com',
          address: 'myeditedaddress',
        })
        .expect(404);

      expect(response.body.error).to.equal('User not found');
    });
  });
  describe('FOLLOW A PERSON /api/v1/users/follows', () => {
    it('should allow a user follow another user', async () => {
      const response = await request(app)
        .post('/api/v1/users/follows')
        .set('x_auth_token', payload.token)
        .send({
          user_id: payload.signupCredTwo.id,
          follower_id: payload.signupCredOne.id,
        })
        .set('x_auth_token', payload.token)
        .set('fcm_token', 'someverylongstring')
        .expect(200);

      expect(response.body).to.equal('follow');
    });

    it('UNAUTHORIZED, should not allow a user who is not signed in to follow someone', async () => {
      const response = await request(app)
        .post('/api/v1/users/follows')
        .send({
          user_id: payload.signupCredOne.id,
          follower_id: payload.signupCredTwo.id,
        })
        .set('fcm_token', 'someverylongstring')
        .expect(401);

      expect(response.body).to.include({ message: 'Please login' });
    });
  });

  describe("GET USER'S FOLLOWERS", () => {
    it('should return the followers for a given user', async () => {
      // get the followers for a particular user...
      const getFollowers = await request(app).get(
        `/api/v1/users/${payload.signupCredOne.id}/following`,
      )
        .set('x_auth_token', payload.token);
      expect(getFollowers.body.length).to.equal(1);
      expect(getFollowers.body[0]).to.haveOwnProperty('fullname');
      expect(getFollowers.body[0]).to.haveOwnProperty('id');
      expect(getFollowers.body[0]).to.haveOwnProperty('follower_id');
    });
  });
  describe('SEARCH /api/v1/users/search?key=someone&value=rukee', () => {
    it('should return the searched object', async () => {
      const response = await request(app)
        .get(`/api/v1/users/search?key=user&value=${payload.signupCredTwo.username}`)
        .set('x_auth_token', payload.token)
        .set('fcm_token', 'anotherlongstring');
      expect(response.body[0]).to.haveOwnProperty('id');
      expect(response.body[0]).to.haveOwnProperty('auth_id');
      expect(response.body[0]).to.haveOwnProperty('username');
      expect(response.body[0]).to.haveOwnProperty('password');
    });
  });
  describe('CHANGE PASSWORD, /api/v1/users/id/change_password', () => {
    it('should allow a user change his password', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${payload.signupCredOne.id}/change_password`)
        .set('x_auth_token', payload.token)
        .send({
          old_password: 'Password123',
          new_password: 'myeditedpassword',
        })
        .expect(200);
      expect(response.body).to.ownProperty('message');
      expect(response.body.message).to.equal('password changed successfully');
    });
    it('should return Invalid if incorrect credentails', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${payload.signupCredOne.id}/change_password`)
        .set('x_auth_token', payload.token)
        .send({
          old_password: 'wrongpassword',
          new_password: 'myeditedpassword',
        })
        .expect(401);
      expect(response.body).to.ownProperty('message');
      expect(response.body.message).to.equal('Invalid');
    });
  });

  describe('FORGOT PASSWORD /ap1/v1/users/forgot_password', () => {
    it('should return the user object with the new password', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgot_password')
        .send({
          auth_id: payload.signinCred.auth_id,
        })
        .expect(200);

      expect(response.body).to.haveOwnProperty('message');
    });
  });

  describe('OTP_VALIDATION /api/v1/users/otp_validation', () => {
    it('should return an error for invalidad otp', async () => {
      const response = await request(app)
        .post('/api/v1/users/otp_validation')
        .set('x_auth_token', payload.token)
        .set('x_request_otp_token', 'someonerandomstring')
        .set('x_request_auth_id', 'mattadesanya@gmail.com')
        .set('x_request_auth_type', 'email')
        .expect(404);
      expect(response.body).to.haveOwnProperty('message');
      expect(response.body.message).to.equal(
        'register the auth_id by getting and validating otp token',
      );
    });
  });
});
