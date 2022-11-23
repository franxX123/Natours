module.exports = (fn) => {
  const outFunc = async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };

  return outFunc;
};
