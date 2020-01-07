const commentLibrary = require('../../libs/v1/comments');

const comment = {};

comment.get = (req, res) => {
  commentLibrary.get(req, res);
};

comment.create = (req, res) => {
  commentLibrary.create(req, res);
};
module.exports = comment;
