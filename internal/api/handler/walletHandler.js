const validator = require("validator");

class WalletHandler {
  constructor(walletService) {
    this.walletService = walletService;
  }

  getCurrentUserWallet = async (req, res) => {
    try {
      let wallet = await this.walletService.getCurrentUserWallet(req.user);
      return res.status(200).json({
        code: 200,
        data: {
          username: req.user.username,
          address: wallet.data.wallet_address,
          balance: wallet.data.balance,
        },
        message: "success",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, error: error, message: "internal server error" });
    }
  };

  topUpWallet = async (req, res) => {
    try {
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

      const result = await this.walletService.topUpWallet(
        req.user,
        parseInt(req.body.amount)
      );

      if (result != 200) {
        return res.status(result.code).json({
          code: result.code,
          message: result.message,
        });
      }

      return res.status(200).json({
        code: 200,
        data: {
          username: req.user.username,
          address: wallet.data.wallet_address,
          balance: wallet.data.balance,
        },
        message: "success",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, error: error, message: "internal server error" });
    }
  };
}

module.exports = WalletHandler;
