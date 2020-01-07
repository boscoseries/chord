const admin = (request, response, next) => {
  // If user is not admin return status code403
  if (request.user.role_id !== 'admin') {
    return response.status(403).send({
      error: 'Forbidden',
    });
  }
  next();
};

module.exports = admin;
