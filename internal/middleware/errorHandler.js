module.exports = (err, req, res, next) => {
  console.log("errors --> ", err);
  res.status(500).json({
    code: 500,
    message: "internal server error",
  });
};
