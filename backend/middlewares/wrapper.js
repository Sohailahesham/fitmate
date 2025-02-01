const asyncWrapper = (asyncFn) => {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

const functionWrapper = (fn) => {
  return (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
};

module.exports = {
  asyncWrapper,
  functionWrapper,
};
