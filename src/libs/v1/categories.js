const debug = require('debug');
const helper = require('../../util/helper');
const { sequelize } = require('../../database-config/connection');
const Category = require('../../models/v1/categories');
const generatePushID = require('../../util/pushid');
const { Hashtag } = require('../../models/v1/hashtags');

const log = debug('http:categories');

const CategoryLibrary = {};

const getTalentPosts = async (categoryId, payload) => {
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;
  const qry = `SELECT posts.id, user_id, category_id, title, media_url, 
  thumbnail_url, posts.created_at, posts.post_duration, users.avatar, 
  users.fullname, users.username, 
  (SELECT COUNT(*) FROM lIKES WHERE likes.post_id=posts.id) AS like_count, 
  (SELECT COUNT(*) FROM comments WHERE comments.post_id=posts.id) AS  comment_count, 
  (SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id=posts.id) AS  share_count
  FROM posts 
  INNER JOIN users ON users.id=posts.user_id  
  WHERE posts.category_id='${categoryId}' AND posts.deleted=0 
  ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const results = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });
  const allposts = await helper.getPost(results);

  const response = helper.filterUnpublishedCompetitionPost(allposts);

  return response;
};

CategoryLibrary.getAllCategoriesWithTalents = async (payload) => {
  const categoriesTalents = [];
  const next = payload.pageNo || 0;
  const limit = payload.pageSize || 15;

  const offset = next >= 1 ? limit * next - limit : 0;

  const qry = `SELECT id, categories.name FROM categories ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const alltalents = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  for (let i = 0, len = alltalents.length; i < len; i += 1) {
    const talentpost = await getTalentPosts(alltalents[i].id, payload);
    const totalPostCount = await helper.getTotalNoOfPost(alltalents[i].id, 'category');
    const talent = {};
    talent.id = alltalents[i].id;
    talent.name = alltalents[i].name;
    talent.totalPostCount = +totalPostCount[0].count;
    talent.posts = talentpost;

    if (talentpost.length !== 0) {
      categoriesTalents.push(talent);
    }
  }

  return categoriesTalents;
};

CategoryLibrary.getOneCategory = async (payload) => {
  const qry = `SELECT id, categories.name FROM categories WHERE id='${payload.id}'`;
  const category = await sequelize.query(qry, {
    type: sequelize.QueryTypes.SELECT,
  });

  const categoriesTalents = [];
  const categorypost = await getTalentPosts(category[0].id, payload);
  const totalPostCount = await helper.getTotalNoOfPost(category[0].id, 'category');
  const results = {};
  results.id = category[0].id;
  results.name = category[0].name;
  results.totalPostCount = +totalPostCount[0].count;
  results.posts = categorypost;
  if (categorypost.length !== 0) {
    categoriesTalents.push(results);
  }
  return categoriesTalents;
};

CategoryLibrary.createCategory = async (req) => {
  try {
    req.body.id = generatePushID();
    const response = await Category.create(req.body);
    const hashtagPayload = {
      id: generatePushID(),
      name: req.body.name,
    };
    await Hashtag.create(hashtagPayload);
    return response;
  } catch (error) {
    return { error };
  }
};

CategoryLibrary.getCategoryList = async (req) => {
  let response;
  try {
    response = await Category.findAll({
      attributes: ['id', 'name'],
    });
    if (response) {
      return response;
    }
  } catch (error) {
    response = { error };
  }

  return response;
};

module.exports = CategoryLibrary;
