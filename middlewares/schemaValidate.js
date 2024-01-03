const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return next(error);
  }
  next();
};

module.exports = {
  validate,
};
