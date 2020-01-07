const debug = require('debug');
const { sequelize } = require('../database-config/connection');
const { sendNotifications } = require('./helper');
const {
  STARTED_COMPETITION: {
    SUBJECT, HTML, PLAIN, SMS,
  },
} = require('./language_helper');

const log = debug('http:cron-jobs');

const workers = {};

workers.init = async () => {
  const query = `SELECT id, vote_start_date 
    FROM competitions
    WHERE vote_start_date <= CURRENT_TIMESTAMP AND 
    vote_end_date >= CURRENT_TIMESTAMP AND alerted=0`;

  const competitions = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  const temp = [];

  if (competitions.length >= 1) {
    for (let i = 0; i < competitions.length; i += 1) {
      temp.push(await workers.getUsers(competitions[i].id));
    }

    const users = await Promise.all(...temp);


    users.map(async (user) => {
      const sms = SMS.replace('{competition}', `${user.title}`);
      const html = HTML.replace('{competition}', `${user.title}`);
      const plain = PLAIN.replace('{competition}', `${user.title}`);
      const smsMSG = sms.replace('{id}', `${user.id}`);
      const htmlMSG = html.replace('{id}', `${user.id}`);
      const plainMSG = plain.replace('{id}', `${user.id}`);
      const data = {
        auth_id: user.auth_id,
        auth_type: user.auth_type,
        phone_number: user.phone_number,
        email: user.email,
        subject: SUBJECT,
        smsMSG,
        htmlMSG,
        plainMSG,
      };

      await sendNotifications(data);
    });
    workers.updateCompetition(competitions);
  }
};

workers.getUsers = async (competitionId) => {
  const query = `SELECT competitions.title, posts.id, users.auth_id, users.auth_type
    FROM posts
    INNER JOIN users ON users.id=posts.user_id
    INNER JOIN competitions ON posts.competition_id=competitions.id
    WHERE posts.competition_id='${competitionId}'`;

  const results = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  return results;
};

workers.updateCompetition = async (competitions) => {
  for (let i = 0; i < competitions.length; i += 1) {
    const query = `UPDATE competitions
    SET alerted = 1
    WHERE
    competitions.id = '${competitions[i].id}'`;

    sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
  }
};


module.exports = workers;
