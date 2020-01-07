const categoryLibrary = require('../../libs/v1/categories');

const category = {};

category.getCategories = async (req, res) => {
  const payload = {
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
  };
  const categories = await categoryLibrary.getAllCategoriesWithTalents(payload);
  if (categories) {
    return res.status(200).json(categories);
  }
  return res.status(400).json({ message: 'Something went wrong' });
};

category.getOneCategory = async (req, res) => {
  const payload = {
    id: req.params.id,
    pageNo: +req.query.pageNo,
    pageSize: +req.query.pageSize,
  };
  const response = await categoryLibrary.getOneCategory(payload);
  if (!response.error) {
    return res.status(200).json(response[0]);
  }

  return res.status(404).json({ message: response.error });
};

category.createCategory = async (req, res) => {
  const response = await categoryLibrary.createCategory(req);
  if (!response.error) {
    return res.status(201).json(response);
  }

  return res.status(400).json({ message: response.error });
};

category.getCategoryList = async (req, res) => {
  const response = await categoryLibrary.getCategoryList(req);
  if (!response.error) {
    return res.status(200).json(response);
  }

  return res.status(500).json({ message: response.error });
};

module.exports = category;
