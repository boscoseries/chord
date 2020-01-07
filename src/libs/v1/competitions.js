/* eslint-disable camelcase */
const formidable = require('formidable');
const debug = require('debug');
const libraryHelper = require('../../util/library_helper');
const languageHelper = require('../../util/language_helper');
const helper = require('../../util/helper');

const models = require('../../models/v1/competitions');
const { sequelize } = require('../../database-config/connection');
const { Post } = require('../../models/v1/posts');
const { User: { findByLogin } } = require('../../models/v1/users');
const { sendNotifications } = require('../../util/helper');
const {
  JOINED_COMPETITION: {
    SUBJECT, HTML, PLAIN, SMS,
  },
} = require('../../util/language_helper');

// eslint-disable-next-line no-unused-vars
const generatePushID = require('../../util/pushid');

const log = debug('http:competition');
const competitionLibrary = {};

competitionLibrary.getAllCompetitions = async (payloadData) => {
  const competitions = await models.Competitions.findAll({
    where: {
      status: payloadData.status || 'published',
    },
    include: [
      {
        model: models.Competition_Banners,
        required: false,
        attributes: ['id', 'banner_url'],
      },
      {
        model: models.Competition_Videos,
        required: false,
        attributes: ['id', 'video_url'],
      },
    ],
  });

  const payload = [];
  for (let i = 0; i < competitions.length; i += 1) {
    if (competitions[i]) {
      // eslint-disable-next-line no-await-in-loop
      const temp = await helper.getCompetitionPost(competitions[i], payloadData);
      payload.push(temp);
    }
  }
  return payload;
};

competitionLibrary.getOneCompetition = async (payloadData) => {
  const competition = await models.Competitions.findOne({
    where: {
      id: payloadData.id,
    },
    include: [
      {
        model: models.Competition_Banners,
        required: false,
        attributes: ['id', 'banner_url'],
      },
      {
        model: models.Competition_Videos,
        required: false,
        attributes: ['id', 'video_url'],
      },
    ],
  });

  const temp = await helper.getCompetitionPost(competition, payloadData);

  return temp;
};

competitionLibrary.PostsToppers = async (competitionId) => {
  const topPost = await helper.getTopPosts(competitionId);
  const schedulerDetails = await helper.schedulerDetails(competitionId);
  return {
    top_posts: topPost,
    ...schedulerDetails[0],
  };
};

competitionLibrary.createCompetition = async (req) => {
  const form = new formidable.IncomingForm();
  let competitionNotification = languageHelper.COMPETITION_NOTIF;
  let competitionData = {};
  const newCompetition = await new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {

      let banner = { body: { Location: 'https://testurl.com/a-/someurltobeusedwhenintest' } };

      let adBanner = { body: { Location: 'https://testurl.com/a-/someurltobeusedwhenintest' } };

      if (process.env.NODE_ENV !== 'test') {
        const bannerData = libraryHelper.upload(files.banner.path, files.banner.name, 'banner');
        const adBannerData = libraryHelper.upload(
          files.banner.path,
          files.adBanner.name,
          'adBanners',
        );
        //  use promise.all() to cut execution time by 3s
        const result = await Promise.all([bannerData, adBannerData]);
        // order result in array
        [banner, adBanner] = result.sort((a, b) => a.body.key < b.body.key);
      }
      const competitionName = fields.title;
      const competitionId = generatePushID();
      competitionNotification = competitionNotification.replace(
        '{competition_name}',
        competitionName,
      );

      const body = {
        id: competitionId,
        adbanner_url: adBanner.body.Location,
        status: fields.status,
        title: fields.title,
        description: fields.description,
        fee: fields.fee || 0.0,
        competition_type: fields.competition_type,
        submission_start_date: fields.submission_start_date,
        submission_end_date: fields.submission_end_date,
        vote_start_date: fields.vote_start_date,
        vote_end_date: fields.vote_end_date,
        owner_id: fields.owner_id,
        criteria: fields.criteria,
      };
      log(body);
      competitionData = {
        id: competitionId,
        action: 'competition',
      };
      
      const competition = await models.Competitions.create(body);
      
      const bannerBody = {
        id: generatePushID(),
        banner_url: banner.body.Location,
        competition_id: competition.id,
      };
      
      const bannerResponse = await models.Competition_Banners.create(bannerBody);

      const response = {
        competition,
        bannerResponse,
      };
      resolve(response);
    });
  });

  const message = {
    token: '/topics/maudition',
    notification: {
      title: 'New Competition',
      body: competitionNotification,
    },
    receiverId: 'mAudition',
    data: competitionData,
  };

  if (process.env.NODE_ENV !== 'test') {
    libraryHelper.sendFCMNotification(message, 'Competition');
  }
  return newCompetition;
};
/**
 * Updates all other fields in competition
 * except banners and adBanners
 *
 * @param {object} req - request object
 * @param {object} res - response object
 * @return {object} updatedData - updated competition
 */
competitionLibrary.updateCompetition = async (req) => {
  const form = new formidable.IncomingForm();
  const newCompetition = await new Promise((resolve) => {
    // eslint-disable-next-line consistent-return
    form.parse(req, async (err, fields) => {
      if (err) {
        return err;
      }
      const body = {
        ...fields,
      };
      const updated = models.Competitions.update(
        {
          ...body,
        },
        {
          where: {
            id: req.params.id,
          },
          returning: true,
          plain: true,
        },
      );
      const results = await updated;
      const updatedData = results[1].dataValues;
      if (updatedData.id) {
        log('update successful');
        resolve(updatedData);
      } else {
        log('update failed');
        resolve({ status: 400, error: 'invalid competition id' });
      }
    });
  });
  return newCompetition;
};

competitionLibrary.createPost = async (req) => {
  const joinedBefore = await helper.joinedBefore(req.params.id, req.headers.user_id);

  if (joinedBefore.length >= 1) {
    return { error: 'joined before' };
  }

  const query = `SELECT * FROM competitions c
  WHERE (c.submission_end_date) > CURRENT_TIMESTAMP AND c.id='${req.params.id}'`;

  const competitionStatus = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  if (competitionStatus.length === 0) {
    return { error: 'competition ended' };
  }

  const form = new formidable.IncomingForm();
  const newCompetiton = await new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      const media = await libraryHelper.upload(files.media_url.path, files.media_url.name, 'post');
      const thumbnail = await libraryHelper.upload(
        files.thumbnail_url.path,
        files.thumbnail_url.name,
        'thumbnail',
      );
      const competitionId = req.params.id;

      const postBody = {
        id: generatePushID(),
        title: fields.caption,
        media_url: media.body.Location,
        thumbnail_url: thumbnail.body.Location,
        user_id: fields.user_id,
        category_id: fields.category_id,
        post_duration: +fields.post_duration || 0,
        deleted: 0,
        competition_id: competitionId,
      };
      try {
        const post = await Post.create(postBody);
        helper.processHashtag(fields.hashtag, post.dataValues.id);
        const response = await helper.getPostDetails(post.dataValues.id);
        resolve(response[0]);
      } catch (error) {
        resolve({ error: error.message });
      }
    });
  });
  // eslint-disable-next-line no-unused-vars
  const notify = new Promise(async (resolve) => {
    const currentUser = await findByLogin(req.headers.user_id);
    const competition = await competitionLibrary.getOneCompetition(req.params);
    const { title, vote_start_date } = competition.competition.dataValues;
    const sms = SMS.replace('{competition}', `${title}`);
    const html = HTML.replace('{competition}', `${title}`);
    const plain = PLAIN.replace('{competition}', `${title}`);
    const smsMSG = sms.replace('{date}', `${vote_start_date.toDateString()}`);
    const htmlMSG = html.replace('{date}', `${vote_start_date.toDateString()}`);
    const plainMSG = plain.replace('{date}', `${vote_start_date.toDateString()}`);
    const { auth_id, auth_type, phone_number, email } = currentUser.dataValues;
    const data = {
      auth_id,
      auth_type,
      phone_number,
      email,
      subject: SUBJECT,
      smsMSG,
      htmlMSG,
      plainMSG,
    };
    if (newCompetiton.id) {
      const result = await sendNotifications(data);
      resolve(result);
    }
  });
  return newCompetiton;
};

competitionLibrary.createVote = async (req) => {
  const { id } = req.params;

  let query;

  query = `SELECT * FROM competitions c
  WHERE c.vote_end_date > CURRENT_DATE AND c.id='${req.params.id}'`;

  const competitionStatus = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  if (competitionStatus.length === 0) {
    return { error: 'competition ended' };
  }

  query = `SELECT competitions.id FROM competitions INNER JOIN competition_judges
  ON competitions.id=competition_judges.competition_id
  WHERE competitions.id='${id}'`;

  const judge = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  if (judge.length !== 0) {
    query = `SELECT competition_votes.id FROM competition_votes
    WHERE competition_votes.post_id='${req.body.post_id}' AND competition_votes.user_id='${req.body.user_id}'
    AND competition_votes.competition_id='${req.params.id}'`;

    const isVoted = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (isVoted.length !== 0) {
      return { error: 'have already voted' };
    }

    const voteBody = {
      id: generatePushID(),
      post_id: req.body.post_id,
      competition_id: req.params.id,
      user_id: req.body.user_id,
      vote: req.query.type === 'up' ? 1 : 0,
    };

    await models.Competition_Votes.create(voteBody);
    return true;
  }
  return { error: 'Judge not found' };
};

/**
 * find match in user_id and competition_id
 *   if user exists in un-subscribed status (0),
 *     then update subscription to (1)
 *   if user exists in subscribed status (1)
 *     then update subscription to (0)
 * @param {object} payload payload object,
 *   which is basically the request object, passed from the controller
 */
competitionLibrary.subscribe = async (payload) => {
  const isValid = await helper.isValid(payload.competition_id, payload.user_id);

  if (isValid.length && !isValid[0].subscribed) {
    const { id } = isValid[0];
    try {
      const updated = await models.Competition_Subscriptions.update(
        {
          subscribed: 1,
        },
        {
          where: {
            id,
          },
          plain: true,
          returning: true,
        },
      );
      const { subscribed } = updated[1];
      return { subscribed, message: 'You are now subscribed to this competition' };
    } catch (error) {
      return error;
    }
  }

  if (isValid.length && isValid[0].subscribed) {
    const { id } = isValid[0];
    try {
      const updated = await models.Competition_Subscriptions.update(
        {
          subscribed: 0,
        },
        {
          where: {
            id,
          },
          plain: true,
          returning: true,
        },
      );
      const { subscribed } = updated[1];
      return { subscribed, message: 'You have unsubscribed from this competition' };
    } catch (error) {
      return error;
    }
  }
  // if user does not exists in subscriptions table
  // subscribe user to the competition
  const id = generatePushID();
  try {
    const result = await models.Competition_Subscriptions.create({ ...payload, id });
    const status = result.dataValues.subscribed;
    return { subscribed: status, message: 'You are now subscribed to this competition' };
  } catch (error) {
    return error;
  }
};

competitionLibrary.changeCompetitionStatus = async (payload) => {
  try {
    const result = await models.Competitions.update(
      {
        status: payload.status,
      },
      {
        where: {
          id: payload.competitionId,
        },
        plain: true,
        returning: true,
      },
    );
    return result;
  } catch (error) {
    return { error };
  }
};


competitionLibrary.updateBanners = async (req) => {
  const adBannerPayload = {};
  const bannerPayload = {};
  adBannerPayload.id = req.params.id;
  const form = new formidable.IncomingForm();
  const updateData = await new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      bannerPayload.bannerId = fields.id;
      if (!bannerPayload.bannerId) {
        let url = fields.adBanner_url;
        if (process.env.NODE_ENV !== 'test') {
          const adBannerData = await libraryHelper.upload(files.adBanner.path, files.adBanner.name, 'adBanners');
          url = adBannerData.body.Location;
        }
        try {
          const result = await models.Competitions.update(
            {
              adbanner_url: url,
            },
            {
              where: {
                id: adBannerPayload.id,
              },
              plain: true,
              returning: true,
            },
          );
          const updated = result[1].adbanner_url;
          return resolve(updated);
        } catch (error) {
          return { error };
        }
      }
      let url = fields.banner_url;
      if (process.env.NODE_ENV !== 'test') {
        const bannerData = await libraryHelper.upload(files.banner.path, files.banner.name, 'banner');
        url = bannerData.body.Location;
      }
      try {
        const result = await models.Competition_Banners.update(
          {
            banner_url: url,
          },
          {
            where: {
              id: bannerPayload.bannerId,
            },
            plain: true,
            returning: true,
          },
        );
        const updated = result[1].banner_url;
        return resolve(updated);
      } catch (error) {
        return { error };
      }
    });
  });
  return updateData;
};

competitionLibrary.addJudges = async (payload) => {
  try {
    payload.judgesId.forEach(async (judge) => {
      await models.Competition_Judges.create({
        id: generatePushID(),
        competition_id: payload.competitionId,
        user_id: judge,
      });
    });
  } catch (error) {
    return { error };
  }

  return { message: 'updated competition judges' };
};

competitionLibrary.splash = async () => {
  try {
    const response = await models.Competitions.findAll({
      attributes: ['id', 'adbanner_url'],
      limit: 3,
      order: [['created_at', 'DESC']],
      where: {
        status: 'published',
      },
    });
    return response;
  } catch (error) {
    return { error };
  }
};

competitionLibrary.removeJudges = async (payload) => {
  try {
    const judge = await models.Competition_Judges.findOne({
      where: {
        user_id: payload.judgeId,
        competition_id: payload.competitionId,
      },
    });
    log(payload);
    if (judge) {
      judge.destroy();
      return { status: 200, message: 'Deleted successfully' };
    }
    return { status: 404, error: 'judge not found' };
  } catch (error) {
    return { status: 404, error: error.message };
  }
};

module.exports = competitionLibrary;
