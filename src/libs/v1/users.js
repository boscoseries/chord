/* eslint-disable no-undef */
/* eslint-disable quotes */
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');
const debug = require('debug');
const generatePushID = require('../../util/pushid');
const { sequelize, Op } = require('../../database-config/connection');
const { User, validateUser } = require('../../models/v1/users');
const followModel = require('../../models/v1/follows');
const tokenAuthModel = require('../../models/v1/token_auth');
const notificationLibrary = require('../../libs/v1/notifications');
const config = require('../../config/config');
const helper = require('../../util/helper');
const libraryHelper = require('../../util/library_helper');
const { fcmDeviceToken } = require('../../models/v1/notifications');

const cryptr = new Cryptr(config.hashingSecret);

const languageHelper = require('../../util/language_helper');

const log = debug('http:user');
const UserLibrary = {};

UserLibrary.getAll = async () => {
  try {
    const user = await User.findAll();
    return user;
  } catch (error) {
    return { error: error.message };
  }
};

const getUserPosts = async (payload) => {
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;

  const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title, posts.media_url, posts.thumbnail_url,
    posts.created_at, posts.post_duration, users.avatar, users.role_id, users.fullname, users.username,
    (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count,
    (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count,
    (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS  post_like_status,
    (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS  bookmark_status
    FROM posts INNER JOIN users ON users.id=posts.user_id WHERE posts.user_id='${payload.id}' AND posts.deleted=0 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const allposts = await helper.getPost(results);

  const response = await helper.filterUnpublishedCompetitionPost(allposts);
  return response;
};

const getUserRolePermissions = async (userId) => {
  let role = '';
  let roleId = '';

  const getRoleQuery = `select role, role_id from users inner join
    roles on users.role_id=roles.id where users.id='${userId}'`;

  const roleItem = await sequelize.query(getRoleQuery, {
    type: sequelize.QueryTypes.SELECT,
  });

  [{ role, role_id: roleId }] = roleItem;

  const getPermissionQuery = `select permission from permissions inner join
      role_permissions on role_permissions.permission_id = permissions.id and
      role_permissions.role_id = '${roleId}'`;

  const permissions = await sequelize.query(getPermissionQuery, {
    type: sequelize.QueryTypes.SELECT,
  });

  const permissionItems = [];
  permissions.forEach((permissionObj) => {
    permissionItems.push(permissionObj.permission);
  });

  return { role, permissions: permissionItems };
};

UserLibrary.getCurrentUser = async (userId) => {
  const userProfile = {};

  if (userId) {
    const qry = `SELECT users.id, users.fullname, users.auth_id, users.auth_type, users.username, users.role_id, users.avatar,
      users.gender, users.height, users.date_of_birth,
      users.email, users.phone_number,
      users.eye_color, users.skin_color,
      users.biography, users.website,
      users.address FROM users WHERE users.id='${userId}'`;
    try {
      const user = await sequelize.query(qry, {
        type: sequelize.QueryTypes.SELECT,
      });

      const rolePermissions = await getUserRolePermissions(userId);
      userProfile.details = user[0] ? { ...user[0] } : '';
      userProfile.role = rolePermissions.role;
      userProfile.permissions = rolePermissions.permissions;
      return userProfile;
    } catch (error) {
      return { error: error.message };
    }
  }

  return { error: 'User not found' };
};

UserLibrary.getProfile = async (payload) => {
  const userprofile = {};
  let qry = '';

  qry = `SELECT users.id, users.role_id, users.fullname, users.auth_id, users.auth_type, users.username, users.avatar,
      users.gender, users.height, users.date_of_birth,
      users.email, users.phone_number,
      users.eye_color, users.skin_color,
      users.biography, users.website,
      users.address, (SELECT COUNT(*) FROM follows WHERE user_id=users.id AND status='1')
      AS follower_count, (SELECT COUNT(*) FROM follows WHERE follower_id=users.id AND status='1' )
      AS following_count, (SELECT COUNT(*) FROM likes INNER JOIN posts ON likes.post_id=posts.id WHERE likes.status='1' AND posts.user_id=users.id )
      AS post_like_count,
      (SELECT COUNT(*) FROM posts WHERE posts.user_id='${payload.id}') AS totalPostCount,
      (SELECT status FROM follows WHERE follower_id='${payload.loggedInUserId || ''}' AND user_id='${payload.id}') AS follow_status FROM users 
      WHERE users.id='${payload.id}'`;

  try {
    const user = await sequelize.query(qry, {
      type: sequelize.QueryTypes.SELECT,
    });
    if (user.length !== 0) {
      const posts = await getUserPosts(payload);
      userprofile.details = user[0] ? { ...user[0] } : {};
      userprofile.posts = posts;
      return userprofile;
    }
    return { error: 'user not found' };
  } catch (error) {
    return { error };
  }
};

UserLibrary.search = async (req, res) => {
  const result = await libraryHelper.search(req);
  if (result) {
    return res.status(200).json(result);
  }
  return res.status(404).json({ message: 'No match found' });
};

UserLibrary.searchAdvanced = async (loggedinUserId, categories, gender, ageRange) => {
  let separatedCategories = ``;
  let ages = '';
  let searchCriteria = '';
  if (categories) {
    if (categories.constructor === Array) {
      separatedCategories = categories.join();
    } else {
      separatedCategories = categories;
    }
    searchCriteria += `C.name IN (${separatedCategories}) AND `;
  }

  if (ageRange) {
    ages = ageRange.split('-');
    searchCriteria += `(C.AgeYear >='${ages[0]}' AND C.AgeYear <= '${ages[1]}') AND `;
  }

  if (gender) {
    searchCriteria += `C.gender='${gender}' AND `;
  }

  searchCriteria = searchCriteria.substr(0, searchCriteria.lastIndexOf('AND'));
  const qry = `SELECT DISTINCT * FROM (SELECT users.id, users.role_id, users.fullname, users.auth_id, users.auth_type, users.username, users.avatar,
    users.gender, users.height, users.date_of_birth,
    users.email, users.phone_number,
    users.eye_color, users.skin_color,
    users.biography, users.website,
    users.address, categories.name, EXTRACT(YEAR FROM age(CURRENT_DATE, users.date_of_birth)) AS AgeYear,
    (SELECT COUNT(*) FROM follows WHERE user_id=users.id AND status='1') AS follower_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id=users.id AND status='1' ) AS following_count,
    (SELECT COUNT(*) FROM likes INNER JOIN posts ON likes.post_id=posts.id WHERE likes.status=1
    AND posts.user_id=users.id ) AS post_like_count
    FROM users
    INNER JOIN posts ON users.id=posts.user_id
    INNER JOIN categories ON posts.category_id=categories.id) AS C
    WHERE ${searchCriteria} ORDER BY C.post_like_count DESC`;

  const user = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  return user;
};

UserLibrary.followers = async (req, res) => {
  const { id } = req.params;
  const loggedin_user_id = req.headers.user_id;

  const qry1 = `select u.id, u.avatar, u.fullname, u.username, f.follower_id,
 (select status from follows where user_id=f.follower_id AND follower_id='${loggedin_user_id}') as follow_status from follows as f inner join users as u on f.follower_id=u.id WHERE f.user_id='${id}' and f.status=1`;
  await sequelize
    .query(qry1, {
      type: sequelize.QueryTypes.SELECT,
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json(error));
};

UserLibrary.following = async (req, res) => {
  const { id } = req.params;
  const loggedin_user_id = req.headers.user_id;

  const qry2 = `select u.id, u.avatar, u.fullname, u.username, f.follower_id,
 (select status from follows where user_id=f.user_id AND follower_id='${loggedin_user_id}') as follow_status from follows as f inner join users as u on f.user_id=u.id WHERE f.follower_id='${id}' and f.status=1`;

  await sequelize
    .query(qry2, {
      type: sequelize.QueryTypes.SELECT,
    })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json(error));
};

UserLibrary.authBySocialMedia = async (payload, deviceToken) => {
  const { validationFeedback } = validateUser(payload);
  if (validationFeedback) {
    return { error: validationFeedback.details[0].message };
  }
  try {
    const isTaken = await User.findByLogin(payload.auth_id);

    if (isTaken) {
      const encryptedToken = cryptr.encrypt(isTaken.token);
      return { id: isTaken.id, role_id: isTaken.role_id, token: encryptedToken };
    }

    const roleId = 'talent';
    const password = payload.auth_id;
    const hashpassword = await helper.hashpassword(password);
    const avatar = payload.avatar || 'https://maudition-bucket.s3.eu-west-2.amazonaws.com/avatar/user.png';

    const id = generatePushID();

    const token = User.generateAuthToken({ id, auth_id: payload.auth_id, role_id: roleId });
    const encryptedToken = cryptr.encrypt(token);

    const data = {
      ...payload,
      id,
      avatar,
      password: hashpassword,
      role_id: roleId,
      token,
      email: auth_id,
    };

    user = await User.create(data);
    notificationLibrary.registerNewFCMToken(id, deviceToken);
    return { ..._.pick(user, ['id', 'role_id']), token: encryptedToken };
  } catch (error) {
    return { status: 404, error: error.message };
  }
};

const sendToken = async (auth_id, auth_type, otp) => {
  if (auth_type === 'phone') {
    return helper.sendSMS(auth_id, otp);
  }
  let htmlEmailBody = languageHelper.OTP_HTML_EMAIL;
  let textEmailBody = languageHelper.OTP_TEXT_EMAIL;

  htmlEmailBody = htmlEmailBody.replace('{otp}', `${otp}`);
  textEmailBody = textEmailBody.replace('{otp}', `${otp}`);

  const htmlEmail = {
    subject: languageHelper.OTP_EMAIL_SUBJECT,
    body: htmlEmailBody,
  };
  const plainEmail = {
    subject: languageHelper.OTP_EMAIL_SUBJECT,
    body: textEmailBody,
  };

  return helper.sendEmail(auth_id, htmlEmail, plainEmail);
};

UserLibrary.sendNotifications = async ({
  auth_id, auth_type, subject, htmlMSG, plainMSG, smsMSG,
},
) => {
  if (auth_type === "phone") {
    helper.sendSMS(auth_id, smsMSG);
  } else {
    const htmlEmail = {
      subject,
      body: htmlMSG,
    };
    const plainEmail = {
      subject,
      body: plainMSG,
    };
    helper.sendEmail(auth_id, htmlEmail, plainEmail);
  }
};

UserLibrary.getUserOTP = async (payload) => {
  const { auth_id,auth_type } = payload;
  const otp = helper.generatePin();
  const id = generatePushID();

  try {
    const user = await User.findByLogin(auth_id);

    if (user) {
      return { status: 409, message: false, error: `${auth_id} already exist` };
    }


    sendToken(auth_id, auth_type, otp);

    try {
      const tokenAuth = await tokenAuthModel.create({
        id,
        auth_id,
        auth_type,
        otp_token: otp,
        status: 0,
      });
      return tokenAuth;
    } catch (error) {
      return { error, status: 500 };
    }
  } catch (error) {
    return { error, status: 404 };
  }
};

const createUser = async (authId, authType) => {
  const user = await User.findOne({
    where: {
      [Op.and]: [{ auth_id: authId }, { auth_type: authType }],
    },
  });

  if (user) {
    return false;
  }
  const id = generatePushID();
  const ROLEID = 'talent'; // this is the role_id for talents, which is the default for all users

  const newuser = await User.create({
    id,
    auth_id: authId,
    auth_type: authType,
    role_id: ROLEID,
  });

  return newuser.id;
};

UserLibrary.validateUserOTP = async (payload) => {
  try {
    const qry = `SELECT * FROM token_auths WHERE auth_id = '${payload.authId}' AND otp_token='${payload.otpToken}'`;

    const authToken = await sequelize.query(qry, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (authToken[0]) {
      const id = await createUser(payload.authId, payload.authType);
      if (!!id === false) {
        return { status: 409, error: 'user already exist' };
      }
      await tokenAuthModel.update(
        { user_id: id, status: 1 },
        {
          where: {
            id: authToken[0].id,
          },
        },
      );
      return { status: 200, valid: true, id };
    }

    return { status: 401, valid: false };
  } catch (error) {
    return { status: 400, error: error.message };
  }
};

UserLibrary.signUpByAuthPassword = async (payload) => {
  const user = await User.findByPk(payload.id);
  let key;
  let value;
  const phoneNumber = /^\+?\d{9,13}/.test(user.auth_id);
  const email = /\S+@\S+\.\S{1,5}/.test(user.auth_id);

  if (phoneNumber) {
    key = "phone_number";
    value = user.auth_id;
  } else if (email) {
    key = "email";
    value = user.auth_id;
  }
  try {
    if (user) {
      user.username = payload.username;
      user.fullname = payload.fullname;
      user[key] = value;
      user.password = await helper.hashpassword(payload.password);
      const token = User.generateAuthToken({
        id: user.id,
        auth_id: user.auth_id,
        role_id: user.role_id,
      });

      const encryptedToken = cryptr.encrypt(token);


      user.token = token;
      user.avatar = payload.avatar || 'https://maudition-bucket.s3.eu-west-2.amazonaws.com/avatar/user.png';
      const response = await user.save();
      notificationLibrary.registerNewFCMToken(user.id, 'payload.deviceToken');
      return { id: response.id, role_id: response.role_id, token: encryptedToken };
    }
    return { status: 400, error: 'Please restart registration' };
  } catch (error) {
    return { status: 404, error: error.message };
  }
};

UserLibrary.signIn = async (payload) => {
  const { error } = validateUser(payload);

  if (error) {
    return { status: 400, error: error.details[0].message };
  }

  try {
    const user = await User.findByLogin(payload.auth_id);

    if (!user) {
      return { status: 401, error: 'Invalid username or password' };
    }

    const validPassword = await bcrypt.compare(payload.password, user.password);

    if (!validPassword) {
      return { status: 401, error: 'Invalid username or password' };
    }

    const data = {
      id: user.id,
      auth_id: user.auth_id,
      role_id: user.role_id,
    };
    // Generating token if login was successfully
    const token = User.generateAuthToken(data);
    const encryptedToken = cryptr.encrypt(token);

    // Validating that token was saved successfully
    if (encryptedToken) {
      user.token = token;
      await user.save();

      return { status: 200, ..._.pick(user, ['id', 'role_id']), token: encryptedToken };
    }
    return { status: 400, error: 'Some error occured' };
  } catch (ex) {
    return { status: 400, error: ex.message };
  }
};

UserLibrary.signOut = async (payload) => {
  try {
    const user = await User.findOne({
      where: {
        id: payload.id,
      },
    });

    if (user) {
      await fcmDeviceToken.destroy({
        where: {
          user_id: payload.id,
        },
      });

      return { status: 200, message: 'Successfully signed out' };
    }
    return { status: 404, error: 'User not found' };
  } catch (error) {
    return { status: 400, error: error.message };
  }
};

UserLibrary.findByUsername = async (username) => {
  try {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    return user;
  } catch (error) {
    return { error };
  }
};

UserLibrary.updateProfile = async (payload) => {
  let updatedUserDetail;
  const { error } = validateUser(payload);

  if (error) {
    return { error: error.details[0].message.replace(/[^\w\s]/gi, ''), status: 400 };
  }

  const user = await User.findByLogin(payload.id);
  if (user) {
    try {
      user.avatar = payload.avatar || user.avatar;
      user.fullname = payload.fullname || user.fullname;
      user.username = payload.username;
      user.email = payload.email;
      user.phone_number = payload.phone_number;
      user.gender = payload.gender;
      user.height = payload.height;
      user.date_of_birth = payload.date_of_birth;
      user.eye_color = payload.eye_colour;
      user.skin_color = payload.skin_colour;
      user.biography = payload.biography;
      user.website = payload.website;
      user.address = payload.address;

      const updatedUser = await user.save();


      const newUser = _.pick(updatedUser.dataValues, ['fullname', 'avatar', 'username',
        'email', 'phone_number', 'gender', 'height', 'date_of_birth', 'eye_color',
        'skin_color', 'biography', 'website', 'address']);

      const response = { ...newUser, status: 200 };
      return response;
    } catch (errorMessage) {
      return { status: 400, error: errorMessage.errors[0].message };
    }
  } else {
    return { status: 404, error: 'User not found' };
  }
};

UserLibrary.updateRole = async ({ userId, role }) => {
  const qry = `SELECT auth_id from users WHERE id = '${userId}'`;
  const auth_id = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  if (role) {
    const data = {
      id: userId,
      auth_id,
      role_id: role,
    };
    const token = User.generateAuthToken(data);
    const updatedRole = await User.update(
      {
        role_id: role,
        token,
      },
      {
        where: {
          id: userId,
        },
        returning: true,
        plain: true,
      },
    );
    return updatedRole[1];
  }
  throw new Error('role not provided');
};

UserLibrary.updateAvatar = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.avatar = req.file.location;
    user
      .save()
      .then((image) => {
        res.status(200).json({ image });
      })
      .catch((error) => {
        res.status(500).json(error.message);
      });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

UserLibrary.follow = async (req, res) => {
  const deviceToken = req.headers.device_token;
  const follow = await followModel.findOne({
    where: {
      [Op.and]: [{ user_id: req.body.user_id }, { follower_id: req.body.follower_id }],
    },
  });

  if (follow) {
    if (follow.status) {
      follow.status = 0;
      await follow
        .save()
        .then(() => res.status(200).json('unfollow'))
        .catch(error => res.status(500).json({ message: error.message }));
    } else {
      follow.status = 1;
      await follow
        .save()
        .then((response) => {
          sendNotification(response, deviceToken);
          res.status(200).json('follow');
        })
        .catch(error => res.status(500).json({ message: error.message }));
    }
  } else {
    followModel
      .create({
        id: generatePushID(),
        status: 1,
        user_id: req.body.user_id,
        follower_id: req.body.follower_id,
      })
      .then((follow) => {
        sendNotification(follow, deviceToken);
        res.status(200).json('follow');
      })
      .catch(error => res.status(500).json({ message: error.message }));
  }
};

const sendNotification = async (follow, deviceToken) => {
  const title = 'mAudition';
  const user = await libraryHelper.getUserDetailsFromUserID(follow.user_id);
  const follower = await User.findOne({
    where: {
      id: follow.follower_id,
    },
  });
  const message = `${follower.username} is now following you`;
  const notification_data = {
    user_id: follow.follower_id,
    avatar: follower.avatar,
    username: follower.username,
    action: 'follow',
  };
  const receiver_id = follow.user_id;
  deviceToken = user.device_token;

  const notificationObject = {
    title,
    token: deviceToken,
    message_body: message,
    data: notification_data,
    avatar: follower.avatar,
    username: follower.username,
    receiverId: receiver_id,
    notification_type: 'follow',
  };

  notificationLibrary.sendFCMNotification(notificationObject);
};

UserLibrary.changePassword = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    const isValid = await bcrypt.compare(req.body.old_password, user.password);
    if (isValid) {
      user.password = await helper.hashpassword(req.body.new_password);
      user
        .save()
        .then(() => res.status(200).json({ message: 'password changed successfully' }))
        .catch(error => res.status(500).json({ message: error.message }));
      return;
    }
    return res.status(401).json({ message: 'Invalid' });
  }
};

UserLibrary.forgotPassword = async (req, res) => {
  const user = await User.findOne({
    where: {
      auth_id: req.body.auth_id,
    },
  });

  if (user) {
    const OTP = helper.generatePin();
    const status = 0;
    const data = {
      id: generatePushID(),
      auth_id: user.auth_id,
      auth_type: user.auth_type,
      otp_token: OTP,
      status,
      user_id: user.id,
    };
    const otp_info = await tokenAuthModel.create(data);
    sendToken(user.auth_id, user.auth_type, OTP);
    return otp_info;
  }
  return false;
};

UserLibrary.validateAllOTP = async (req, res) => {
  const authId = req.headers.x_request_auth_id;
  const otpToken = req.headers.x_request_otp_token;

  const otp = await tokenAuthModel.findOne({
    where: {
      [Op.and]: [{ auth_id: authId }, { otp_token: otpToken }],
    },
    attributes: ['status', 'id', 'user_id', 'auth_type'],
  });

  const user = await User.findOne({
    where: {
      [Op.and]: [{ auth_id: authId }, { auth_type: otp.auth_type }],
    },
    attributes: ['id'],
  });

  if (!otp.status) {
    await tokenAuthModel.update(
      { status: 1, user_id: user.id },
      {
        where: {
          id: otp.id,
        },
      },
    );
    return otp;
  }
  return false;
};

UserLibrary.resetPassword = async (req, res) => {
  const auth_token = await tokenAuthModel.findOne({
    where: {
      [Op.and]: [{ auth_id: req.body.auth_id }, { otp_token: req.headers.x_request_otp_token }],
    },
  });
  const password = await helper.hashpassword(req.body.password);
  if (auth_token) {
    if (auth_token.status) {
      const user = await User.findByPk(auth_token.user_id);
      if (user) {
        await User.update(
          { password },
          {
            where: {
              id: auth_token.user_id,
            },
          },
        )
          .then(() => {
            // This query deletes the row from token_auths after updating the password in user table
            auth_token.destroy();

            return res.status(200).json({ message: 'Password updated successfully' });
          })
          .catch(error => res.status(404).json({ message: 'User not found', error: error.message }));
        return;
      }
      res.status(404).json({ message: 'user not found' });
    }
    res.status(404).json({ message: 'invalid token' });
  }

  res.status(404).json({ message: 'auth id does not exist' });
};

UserLibrary.liked = async (payload) => {
  try {
    const next = payload.pageNo || 0;
    const limit = payload.pageSize || 15;

    const offset = next >= 1 ? limit * next - limit : 0;

    const qry = `SELECT posts.id, posts.user_id, posts.category_id, posts.title, 
    posts.media_url, posts.thumbnail_url, posts.created_at, posts.post_duration,
    users.avatar, users.role_id, users.fullname, users.username,
    (SELECT COUNT(*) FROM likes WHERE likes.post_id=posts.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS comment_count,
    (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS share_count,
    (SELECT status FROM likes WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS post_like_status,
    (SELECT status FROM post_bookmarks WHERE post_id=posts.id AND user_id='${payload.loggedInUserId}') AS bookmark_status FROM posts
    INNER JOIN users ON users.id=posts.user_id
    INNER JOIN likes ON posts.id=likes.post_id
    WHERE likes.user_id='${payload.id}' AND posts.deleted=0 AND likes.status=1 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const results = await sequelize.query(qry, {
      type: sequelize.QueryTypes.SELECT,
    });

    const allposts = await helper.getPost(results, payload.loggedInUserId);
    const response = await helper.filterUnpublishedCompetitionPost(allposts);
    const totalPostCount = await helper.getTotalNoOfPost(payload.id, 'user');
    const data = {
      totalPostCount: totalPostCount[0].count,
      posts: response,
    };
    return data;
  } catch (error) {
    return { status: 400, error: error.message };
  }
};
module.exports = UserLibrary;
