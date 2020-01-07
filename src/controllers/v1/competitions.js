const debug = require('debug');
const competitionLibrary = require('../../libs/v1/competitions');
const schema = require('../../util/validation');
const helper = require('../../util/helper');

// eslint-disable-next-line no-unused-vars
const log = debug('http:competition_controller');

const competition = {};

competition.getAllCompetitions = async (req, res) => {
  const payload = {
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
    status: req.query.status,
    loggedInUser: req.headers.user_id,
  };
  const response = await competitionLibrary.getAllCompetitions(payload);

  if (response) {
    return res.status(200).json(response);
  }

  return res.status(500).json({ message: 'Something went wrong' });
};

competition.getOneCompetition = async (req, res) => {
  const payload = {
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
    loggedInUser: req.headers.user_id,
    id: req.params.id,
  };
  const response = await competitionLibrary.getOneCompetition(payload);
  if (response) {
    return res.status(200).json(response);
  }

  return res.status(404).json({ message: 'Competition not found' });
};


competition.PostsToppers = async (req, res) => {
  const competitionId = req.params.id;
  const loggedInUser = req.headers.user_id;
  try {
    const result = await competitionLibrary.PostsToppers(competitionId, loggedInUser);
    res.status(200).json({
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

competition.createCompetition = async (req, res) => {
  const response = await competitionLibrary.createCompetition(req);
  if (response) {
    return res.status(201).json(response);
  }

  return res.status(400).json({ message: 'Bad request' });
};

competition.createPost = async (req, res) => {
  const userId = req.headers.user_id;
  const phoneNumber = req.query.phone_number;
  const hasNumber = await helper.hasPhoneNumber(userId);
  if (!phoneNumber && hasNumber.status === 404) {
    return res.status(404).json({
      status: 404,
      error: 'phone number required',
    });
  }
  if (phoneNumber && hasNumber.status === 404) {
    try {
      await helper.updatePhoneNumber(phoneNumber, userId);
      const response = await competitionLibrary.createPost(req);
      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  if (!phoneNumber && hasNumber.status === 200) {
    try {
      const response = await competitionLibrary.createPost(req);
      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
};

competition.createVote = async (req, res) => {
  const response = await competitionLibrary.createVote(req);
  if (response.error) {
    return res.status(404).json({ message: response.error });
  }

  return res.status(200).json({ message: 'Voted successfully' });
};

/**
 * Updates all other fields in competition except status
 *
 * @param {object} req request object
 * @param {object} res response object
 * @return {object} res.status
 */
// eslint-disable-next-line consistent-return
competition.updateCompetition = async (req, res) => {
  try {
    // call function to update a competition library.js
    const response = await competitionLibrary.updateCompetition(req);
    if (response) {
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

competition.changeCompetitionStatus = async (req, res) => {
  const payload = {
    competitionId: req.params.id,
    status: req.query.status,
  };
  const response = await competitionLibrary.changeCompetitionStatus(payload);
  if (response.error) {
    return res.status(404).json({ message: response.error });
  }
  log(response);
  return res.status(200).json({
    message: 'Status updated successfully',
    newStatus: response[1].status,
  });
};

competition.updateBanners = async (req, res) => {
  try {
    const response = await competitionLibrary.updateBanners(req);
    return res.status(200).json({
      message: 'Update successful',
      url: response,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

competition.addJudges = async (req, res) => {
  const payload = {
    competitionId: req.params.id,
    judgesId: req.body.judges,
  };

  const response = await competitionLibrary.addJudges(payload);
  if (response.error) {
    return res.status(404).json({ message: response.error });
  }

  return res.status(200).json({ message: 'updated competition judges' });
};

competition.subscribe = async (req, res) => {
  const payload = {
    competition_id: req.params.id,
    user_id: req.headers.user_id,
  };

  const { error, value } = schema.validate(payload);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  const response = await competitionLibrary.subscribe(value);

  if (response.error) {
    return res.status(400).json({
      message: response.error,
    });
  }

  return res.status(201).json({
    ...response,
  });
};

competition.getSplash = async (req, res) => {
  const response = await competitionLibrary.splash();
  if (response.error) {
    return res.status(404).json({ message: response.error });
  }

  return res.status(200).json(response);
};

competition.removeJudges = async (req, res) => {
  const payload = {
    competitionId: req.params.id,
    judgeId: req.body.judgeId,
  };

  const response = await competitionLibrary.removeJudges(payload);

  if (response.error) {
    return res.status(response.status).json({ message: response.error });
  }
  return res.status(200).json(response);
};

module.exports = competition;
