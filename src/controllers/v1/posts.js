const postLibrary = require('../../libs/v1/posts');

const post = {};

post.get = async (req, res) => {
  await postLibrary.getAll(req, res);
};

post.getOne = async (req, res) => {
  const payload = {
    id: req.params.id,
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
    loggedInUserId: req.headers.user_id,
  };
  const response = await postLibrary.getOne(payload);
  if (response.error) {
    return res.status(response.status).json(response.error);
  }
  return res.status(200).json(response);
};

post.getBookmarks = async (req, res) => {
  const { userid } = req.headers;

  const bookmarks = await postLibrary.getBookMarks(userid);
  if (bookmarks) {
    return res.status(200).json(bookmarks);
  }

  return res.status(404).json({ message: 'error getting bookmarks' });
};

post.newsfeeds = async (req, res) => {
  await postLibrary.getNewsfeed(req, res);
};

post.personalizedNewsfeeds = async (req, res) => {
  const response = await postLibrary.getPersonalizedNewsFeed(req);
  if (!response.error) {
    return res.status(200).json(response);
  }

  return res.status(response.status).json(response);
};

post.category = async (req, res) => {
  await postLibrary.category(req, res);
};

post.newPost = async (req, res) => {
  const response = await postLibrary.createPost(req);
  if (response) {
    return res.status(201).json(response);
  }

  return res.status(400).json({ message: 'Bad request' });
};

post.newBookmark = async (req, res) => {
  const userId = req.headers.user_id;
  const postId = req.params.id;
  const newbookmark = await postLibrary.createBookMark(postId, userId);
  if (newbookmark) {
    return res.status(200).json(newbookmark);
  }

  return res.status(400).json({ message: 'error creating bookmark' });
};

post.likes = async (req, res) => {
  await postLibrary.likes(req, res);
};

post.createPostViewCount = async (req, res) => {
  const payload = {};
  payload.postId = req.params.id;
  payload.userId = req.body.user_id;
  payload.viewTime = req.body.view_time;
  payload.postDuration = req.body.post_duration;
  const response = await postLibrary.createPostViewCount(payload);
  if (response.error) {
    return res.status(400).json({ message: response.error });
  }
  res.status(200).json({ 'post point': response });
};

post.delete = async (req, res) => {
  const payload = {
    id: req.params.id,
  };

  const response = await postLibrary.delete(payload);
  if (response.error) {
    return res.status(response.status).json({ message: response.error });
  }
  return res.status(response.status).json(response);
};

post.shares = async (req, res) => {
  const payload = {
    post_id: req.params.id,
    ...req.body,
  };

  const response = await postLibrary.shares(payload);
  if (response.error) {
    return res.status(response.status).json({ error: response.error });
  }
  return res.status(response.status).json(response);
};

module.exports = post;
