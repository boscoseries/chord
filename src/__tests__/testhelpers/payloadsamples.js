const Cryptr = require('cryptr');
const debug = require('debug');

const config = require('../../config/config');

const cryptr = new Cryptr(config.hashingSecret);
const { User } = require('../../models/v1/users');

const log = debug('http:payload');

const Payload = {};

Payload.signinCred = {
  auth_id: 'mattadesanya@gmail.com',
  password: 'Password123',
};

Payload.signupCred = {
  id: '-LmnoGawGnWS36fW-ghX',
  avatar: 'https://maudition-bucket.s3.eu-west-2.amazonaws.com/6.jpg',
  auth_id: 'mattadesanya@gmail.com',
  auth_type: 'phone',
  username: 'mattoranking',
  fullname: 'Matt Adesanya',
  password: 'Password123',
  role_id: 'talent',
};

Payload.signupCredOne = {
  id: '-LrPpU4mkJtOoszJYUjL',
  auth_id: 'mattadesanya@gmail.com',
  username: 'matho1',
  auth_type: 'email',
  role_id: 'talent',
};

Payload.signupCredAdmin = {
  id: '-LrPpU4mkJtOoszJYUjL',
  auth_id: 'mattadesanya@gmail.com',
  username: 'matho1',
  auth_type: 'email',
  role_id: 'admin',
};

Payload.signupCredTwo = {
  id: '-LrPpU4mkJtOoszJYUjM',
  auth_id: 'anotherusertwo@gmail.com',
  username: 'usertwo',
  auth_type: 'email',
  role_id: 'talent',
};

Payload.postOne = {
  id: '-LrNi5tz6E75D7nLhIW8',
  title: 'post one',
  media_url: 'https://ca.slack-edge.com/TAVJ26W1K-UAZC0Q6QH-fc64f94e1a1a-72',
  thumbnail_url: 'https://ca.slack-edge.com/TAVJ26W1K-UAZC0Q6QH-fc64f94e1a1a-72',
  post_duration: 34,
  user_id: Payload.signupCredOne.id,
};

Payload.postTwo = {
  id: '-LrPpU4mkJtOoszJYUjM',
  title: 'post two',
  media_url: 'https://ca.slack-edge.com/TAVJ26W1K-UAZC0Q6QH-fc64f94e1a1a-72',
  thumbnail_url: 'https://ca.slack-edge.com/TAVJ26W1K-UAZC0Q6QH-fc64f94e1a1a-72',
  post_duration: 200,
  user_id: '-LrPpU4mkJtOoszJYUjM',
};


const token = User.generateAuthToken({
  id: Payload.signupCredOne.id,
  auth_id: 'mattadesanya@gmail.com',
  role_id: 'talent',
});

const adminToken = User.generateAuthToken({
  id: Payload.signupCredOne.id,
  auth_id: 'mattadesanya@gmail.com',
  role_id: 'admin',
});


Payload.token = cryptr.encrypt(token);
Payload.adminToken = cryptr.encrypt(adminToken);


Payload.comment = {
  id: '-LrNzxkSAwAgtvL9-FdD',
  comment: 'I just made a comment on this post',
  post_id: '-LrNi5tz6E75D7nLhIW8',
  user_id: Payload.signupCredOne.id,
};

Payload.notificationMessage = {
  id: '-LrXwYbrB4hvcET1Qv27',
  user_id: Payload.signupCredOne.id,
  notification_message: 'Hello, welcome to maudition',
  notification_type: 'Registration',
};

Payload.competitionOne = {
  id: '-Ls8l2S4_HVuvgSHoJHj',
  title: 'DanceHall',
  owner_id: Payload.signupCredAdmin.id,
  competition_type: 'free',
  criteria: 'strictly adults',
  status: 'published',
  submission_start_date: `${new Date().toJSON()}`,
  submission_end_date: `${new Date().toJSON()}`,
  vote_start_date: `${new Date().toJSON()}`,
  vote_end_date: `${new Date().toJSON()}`,
  adbanner_url:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
  banner:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
};

Payload.competitionTwo = {
  id: '-LsCow0UmtKA0vrw6CNx',
  title: 'Competition Two',
  owner_id: Payload.signupCredAdmin.id,
  competition_type: 'free',
  fee: 200,
  criteria: 'strictly adults',
  status: 'published',
  submission_start_date: `${new Date().toJSON()}`,
  submission_end_date: `${new Date().toJSON()}`,
  vote_start_date: `${new Date().toJSON()}`,
  vote_end_date: `${new Date().toJSON()}`,
  adbanner_url:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
  banner:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
};

Payload.competitionTwo = {
  id: '-LsCow0UmtKA0vrw6CNx',
  title: 'Competition Two',
  owner_id: Payload.signupCredAdmin.id,
  competition_type: 'free',
  fee: 200,
  criteria: 'strictly adults',
  status: 'published',
  submission_start_date: `${new Date().toJSON()}`,
  submission_end_date: `${new Date().toJSON()}`,
  vote_start_date: `${new Date().toJSON()}`,
  vote_end_date: `${new Date().toJSON()}`,
  adbanner_url:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
  banner:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
};

Payload.competitionThree = {
  id: '-LsCp6869HSMAILlxBDV',
  title: 'Competition Three',
  owner_id: Payload.signupCredAdmin.id,
  competition_type: 'free',
  criteria: 'strictly adults',
  status: 'closed',
  submission_start_date: `${new Date().toJSON()}`,
  submission_end_date: `${new Date().toJSON()}`,
  vote_start_date: `${new Date().toJSON()}`,
  vote_end_date: `${new Date().toJSON()}`,
  adbanner_url:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
  banner:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
};

Payload.competitionFour = {
  id: '-LsCq94-W5WNtsqR44Sd',
  title: 'Competition Three',
  owner_id: Payload.signupCredAdmin.id,
  competition_type: 'free',
  criteria: 'strictly adults',
  status: 'draft',
  submission_start_date: `${new Date().toJSON()}`,
  submission_end_date: `${new Date().toJSON()}`,
  vote_start_date: `${new Date().toJSON()}`,
  vote_end_date: `${new Date().toJSON()}`,
  adbanner_url:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
  banner:
    'https://yt3.ggpht.com/a-/AAuE7mA8u7N1Ku_qTlkb6ZrzoXiqasxqjtjIw1q7nA=s88-c-k-c0x00ffffff-no-rj-mo',
};

Payload.competitionBanner = {
  id: '-LqMZ8UaGaUmvDF3XFez',
  banner_url: Payload.competitionOne.banner,
  competition_id: Payload.competitionOne.id,
};
module.exports = Payload;
