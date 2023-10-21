const {
  walletAddressGenerator,
  pinHashGenerator,
} = require("../helper/walletAddressGenerator");

class TransactionService {
  constructor(walletRepo, transactionRepo, redis, txRepo) {
    this.walletRepo = walletRepo;
    this.txRepo = txRepo;
    this.transactionRepo = transactionRepo;
    this.redis = redis;
  }

  payment = async (
    userInfo,
    amount,
    recipientAddress,
    redisMaxTimeTransactionInSecond
  ) => {
    let transactionId = "";
    const tx = await this.txRepo.startTx();
    try {
      const recipient = await this.walletRepo.findWalletByAddress(
        recipientAddress
      );

      if (!recipient) {
        throw "recipient address not found";
      }

      //generate sha256 to check current user wallet address
      const userWalletAddress = await walletAddressGenerator(
        userInfo.username,
        userInfo.email
      );

      //find current user wallet address
      const userWallet = await this.walletRepo.findWalletByAddress(
        userWalletAddress
      );

      if (userWallet.wallet_address == recipientAddress) {
        throw "invalid recipient address";
      }

      if (userWallet.balance < amount) {
        throw "insuficient balance";
      }

      const transaction = await this.transactionRepo.createTransaction({
        recipient_address: recipientAddress,
        sender_address: userWalletAddress,
        amount: amount,
      });

      transactionId = transaction.id;

      this.txRepo.commitTx(tx);

      this.redis.set(
        `transaction:${transactionId}`,
        "",
        redisMaxTimeTransactionInSecond
      );

      //set payment confirmation max attemp
      await this.redis.set(
        `attemp:${transactionId}`,
        0,
        redisMaxTimeTransactionInSecond
      );
    } catch (error) {
      this.txRepo.rollbackTx(tx);

      if (error == "invalid recipient address") {
        return { message: "bad request", error, code: 400 };
      }

      if (error == "insuficient balance") {
        return { message: "bad request", error, code: 400 };
      }

      if (error == "recipient address not found") {
        return {
          message: "bad request",
          error: "recipient address not found",
          code: 400,
        };
      }

      throw error;
    }

    return {
      message: "success",
      data: { transaction_id: transactionId },
      code: 200,
    };
  };

  confirmPayment = async (
    userInfo,
    transactionId,
    pin,
    userIp,
    redisMaxTimeTransactionInSecond
  ) => {
    let attemp = await this.redis.get(`attemp:${transactionId}`);

    if (attemp == 3) {
      await this.redis.delete(`transaction:${transactionId}`);

      await this.redis.delete(`attemp:${transactionId}`);

      // update transaction status
      await this.transactionRepo.updateTransactionStatus(
        "failed",
        transactionId
      );

      return {
        message: "unauthorize",
        error: "max failed pin attemp reached!",
        code: 401,
      };
    }

    const tx = await this.txRepo.startTx();
    try {
      const redisTransaction = await this.redis.get(
        `transaction:${transactionId}`
      );

      if (redisTransaction === null) {
        // update transaction status
        await this.transactionRepo.updateTransactionStatus(
          "failed",
          transactionId
        );

        throw "transaction not found";
      }

      const transactionData = await this.transactionRepo.findTransaction(
        transactionId,
        "pending"
      );

      const recipient = await this.walletRepo.findWalletByAddress(
        transactionData.recipient_address
      );

      if (!recipient) {
        throw "recipient address not found";
      }

      //generate sha256 to check current user wallet address
      const userWalletAddress = await walletAddressGenerator(
        userInfo.username,
        userInfo.email
      );

      //find current user wallet address
      const userWallet = await this.walletRepo.findWalletByAddress(
        userWalletAddress
      );

      if (userWallet.balance < transactionData.amount) {
        throw "insuficient balance";
      }

      const pinHash = await pinHashGenerator(pin);
      if (userWallet.pin !== pinHash) {
        await this.redis.set(
          `attemp:${transactionId}`,
          `${parseInt(attemp) + 1}`,
          redisMaxTimeTransactionInSecond
        );

        throw "wrong pin";
      }

      //update current user balance
      await this.walletRepo.updateBalance(
        userWallet.balance - transactionData.amount,
        userWalletAddress
      );

      //update recipience balance
      await this.walletRepo.updateBalance(
        recipient.balance + transactionData.amount,
        recipient.wallet_address
      );

      //update transaction status
      await this.transactionRepo.updateTransactionStatus(
        "success",
        transactionId
      );

      this.txRepo.commitTx(tx);
    } catch (error) {
      console.log("error --> ", error);
      this.txRepo.rollbackTx(tx);

      if (error == "transaction not found") {
        return { message: "bad request", error, code: 404 };
      }

      if (error == "insuficient balance") {
        return { message: "bad request", error, code: 400 };
      }

      if (error == "wrong pin") {
        return { message: "unauthorize", error, code: 401 };
      }

      if (error == "recipient address not found") {
        return {
          message: "bad request",
          error: "recipient address not found",
          code: 400,
        };
      }

      return { message: "internal server error", code: 500 };
    }

    return { message: "success", code: 200 };
  };
}

module.exports = TransactionService;
