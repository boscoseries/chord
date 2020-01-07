const hashtagLibrary = require('../../libs/v1/hashtags');

const hashtag = {};

hashtag.getAllHashtags = async (req, res) => {
  const payload = {
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
  };
  const response = await hashtagLibrary.getAllHashtags(payload);
  if (response) {
    return res.status(200).json(response);
  }

  return res.status(500).json({ message: 'Something went wrong' });
};

hashtag.createHashtag = async (req, res) => {
  const response = await hashtagLibrary.createHashtag(req);
  if (response) {
    return res.status(200).json(response);
  }

  return res.status(400).json({ message: 'Bad request' });
};

hashtag.getHashtag = async (req, res) => {
  const payload = {
    id: req.params.id,
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
  };
  const response = await hashtagLibrary.getHashtag(payload);
  if (response) {
    return res.status(200).json(response);
  }

  return res.status(404).json({ message: 'Hashtag not found' });
};

module.exports = hashtag;
