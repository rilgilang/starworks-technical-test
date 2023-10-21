require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const validator = require("validator");
const { checkIfValidSHA256 } = require("../../helper/sha256Validation");

class TransactionHandler {
  constructor(transactionService) {
    this.transactionService = transactionService;
  }
  payment = async (req, res, next) => {
    try {
      if (!req.body.recipient || req.body.recipient === "") {
        return res.status(400).json({
          code: 400,
          error: "recipient cannot be empty",
          message: "bad request",
        });
      }

      if (!checkIfValidSHA256(req.body.recipient)) {
        return res.status(400).json({
          code: 400,
          error: "recipient address not valid!",
          message: "bad request",
        });
      }

      if (!req.body.amount || req.body.amount === "") {
        return res.status(400).json({
          code: 400,
          error: "amount cannot be empty",
          message: "bad request",
        });
      }

      if (!validator.isNumeric(`${req.body.amount}`)) {
        return res.status(400).json({
          code: 400,
          error: "amount must be integer",
          message: "bad request",
        });
      }

      if (parseInt(req.body.amount) < 5000) {
        return res.status(400).json({
          code: 400,
          error: "amount cannot be less than 5000",
          message: "bad request",
        });
      }

      if (parseInt(req.body.amount) > 1000000) {
        return res.status(400).json({
          code: 400,
          error: "amount cannot be more than 1000000",
          message: "bad request",
        });
      }

      const result = await this.transactionService.payment(
        req.user,
        parseInt(req.body.amount),
        req.body.recipient,
        process.env.REDIS_MAX_TIME_TRANSACTION_SECOND
      );

      if (result.code != 200) {
        return res.status(result.code).json({
          code: result.code,
          error: result.error,
          message: result.message,
        });
      }

      return res.status(200).json({
        code: 200,
        data: result.data,
        message: "success",
      });
    } catch (error) {
      next(error);
    }
  };

  confirmPayment = async (req, res, next) => {
    try {
      if (!req.body.payment_id || req.body.payment_id === "") {
        return res.status(400).json({
          code: 400,
          error: "payment_id cannot be empty",
          message: "bad request",
        });
      }

      if (!req.body.pin || req.body.pin === "") {
        return res.status(400).json({
          code: 400,
          error: "pin cannot be empty",
          message: "bad request",
        });
      }

      if (!validator.isNumeric(`${req.body.pin}`)) {
        return res.status(400).json({
          code: 400,
          error: "pin must be integer",
          message: "bad request",
        });
      }

      if (`${req.body.pin}`.length != 6) {
        return res.status(400).json({
          code: 400,
          error: "pin must be 6 digit",
          message: "bad request",
        });
      }

      const result = await this.transactionService.confirmPayment(
        req.user,
        req.body.payment_id,
        req.body.pin,
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        process.env.REDIS_MAX_TIME_TRANSACTION_SECOND
      );

      if (result.code != 200) {
        return res.status(result.code).json({
          code: result.code,
          error: result.error,
          message: result.message,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "success",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TransactionHandler;
