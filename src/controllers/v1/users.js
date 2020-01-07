const _ = require('lodash');
const debug = require('debug');
const userLibrary = require('../../libs/v1/users');
const { setCache } = require('../../middleware/cache');

const log = debug('http:user-controller');
const user = {};
user.get = async (req, res) => {
  const response = await userLibrary.getAll();

  if (!response.error) {
    // setCache(req.originalUrl, response);
    return res.status(200).json(response);
  }
  return res.status(404).json({ message: response.error });
};

user.authBySocialMedia = async (req, res) => {
  const payload = { ...req.body };
  const deviceToken = req.headers.fcm_token;
  const response = await userLibrary.authBySocialMedia(payload, deviceToken);
  if (response.error) {
    return res.status(response.status).json(response.error);
  }
  return res.status(200).json(response);
};

user.signUpByAuthPassword = async (req, res) => {
  const payload = { ...req.body, deviceToken: req.headers.fcm_token };
  const response = await userLibrary.signUpByAuthPassword(payload);
  if (response.error) {
    return res.status(response.status).json(response.error);
  }
  return res.status(200).json(_.pick(response, ['token', 'id', 'role_id']));
};

user.signIn = async (req, res) => {
  const payload = {
    auth_id: req.body.auth_id,
    password: req.body.password,
  };
  const response = await userLibrary.signIn(payload);
  if (!response.error) {
    return res.status(response.status).json(response);
  }
  return res.status(response.status).json({ error: response.error });
};

user.signOut = async (req, res) => {
  const payload = {
    id: req.params.id,
    loggedInUserId: req.headers.user_id,
    token: req.headers.x_auth_token,
  };
  const response = await userLibrary.signOut(payload);
  if (!response.error) {
    return res.status(response.status).json(response);
  }
  return res.status(response.status).json({ error: response.error });
};

user.getUser = async (req, res) => {
  const payload = {
    id: req.params.id,
    loggedInUserId: req.headers.user_id,
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
  };
  const response = await userLibrary.getProfile(payload);
  if (!response.error) {
    // setCache(req.originalUrl, response);
    return res.status(200).json(response);
  }
  return res.status(404).json({ message: response.error });
};

user.getCurrentUser = async (req, res) => {
  const id = req.headers.user_id;
  const currentUser = await userLibrary.getCurrentUser(id);
  if (!currentUser.error) {
    return res.status(200).json(currentUser);
  }
  return res.status(404).json({ message: 'User not found' });
};

user.search = async (req, res) => {
  await userLibrary.search(req, res);
};

user.searchAdvanced = async (req, res) => {
  const userId = req.headers.userid;
  const categories = req.query.category;
  const { gender } = req.query;
  const ageRange = req.query.age_range;

  const searchResult = await userLibrary.searchAdvanced(userId, categories, gender, ageRange);
  if (searchResult) {
    return res.status(200).json(searchResult);
  }

  return res.status(400).json({ message: 'error with advanced search' });
};

user.followers = async (req, res) => {
  await userLibrary.followers(req, res);
};

user.following = async (req, res) => {
  await userLibrary.following(req, res);
};

user.generateOTP = async (req, res) => {
  const { auth_id, auth_type } = req.query;
  const payload = { auth_id, auth_type };
  const response = await userLibrary.getUserOTP(payload);
  if (!response.error) {
    return res.status(200).send('ok');
  }

  res.status(response.status).json({ error: response.error });
};

user.validateOTP = async (req, res) => {
  const payload = {
    authId: req.headers.x_request_auth_id,
    otpToken: req.headers.x_request_otp_token,
    authType: req.headers.x_request_auth_type,
  };
  const result = await userLibrary.validateUserOTP(payload);
  if (result.error) {
    return res.status(result.status).json(result.error);
  }
  if (result.valid) {
    return res.status(result.status).json(result);
  }
  return res
    .status(404)
    .json({ message: 'register the auth_id by getting and validating otp token' });
};

user.updateProfile = async (req, res) => {
  const payload = { ...req.body, id: req.params.id };
  const response = await userLibrary.updateProfile(payload);

  if (!response.error) {
    return res.status(200).json(response);
  }

  return res.status(response.status).json(response);
};

user.updateRole = async (req, res) => {
  const payload = { role: req.body.role, userId: req.params.id };
  try {
    const response = await userLibrary.updateRole(payload);
    return res.status(200).json({
      status: 200,
      message: response,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

user.updateAvatar = async (req, res) => {
  await userLibrary.updateAvatar(req, res);
};

user.follow = async (req, res) => {
  await userLibrary.follow(req, res);
};

user.changePassword = async (req, res) => {
  await userLibrary.changePassword(req, res);
};

user.forgotPassword = async (req, res) => {
  const result = await userLibrary.forgotPassword(req);
  if (result) {
    return res.status(200).json({ message: result.otp_token });
  }
  return res.status(404).json({ message: 'User not found' });
};

user.validateAllOTP = async (req, res) => {
  const userId = await userLibrary.validateAllOTP(req);
  if (userId) {
    return res.status(200).json({ valid: true, userId });
  }

  return res.status(400).json({ valid: false, id: 'invalid' });
};

user.resetPassword = async (req, res) => {
  await userLibrary.resetPassword(req, res);
};

user.liked = async (req, res) => {
  const payload = {
    id: req.params.id,
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
    loggedInUserId: req.headers.user_id,
  };
  const response = await userLibrary.liked(payload);
  if (response.error) {
    return res.status(response.status).json(response.error);
  }
  return res.status(200).json(response);

};

module.exports = user;
