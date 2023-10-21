const { walletAddressGenerator } = require("../helper/walletAddressGenerator");

class WalletService {
  constructor(walletRepo, transactionRepo, redis, txRepo) {
    this.walletRepo = walletRepo;
    this.txRepo = txRepo;
    this.transactionRepo = transactionRepo;
    this.redis = redis;
  }
  getCurrentUserWallet = async (userInfo) => {
    const walletAddress = await walletAddressGenerator(
      userInfo.username,
      userInfo.email
    );

    const wallet = await this.walletRepo.findWalletByAddress(walletAddress);

    return { message: "success", data: wallet, code: 200 };
  };

  topUpWallet = async (userInfo, amount) => {
    const walletAddress = await walletAddressGenerator(
      userInfo.username,
      userInfo.email
    );

    const tx = await this.txRepo.startTx();

    try {
      const lastAmount = await this.walletRepo.findWalletByAddress(
        walletAddress
      );

      const newAmount = lastAmount.balance + amount;

      await this.walletRepo.updateBalance(newAmount, walletAddress);

      this.txRepo.commitTx(tx);
    } catch (error) {
      this.txRepo.rollbackTx(tx);
      return { message: "internal server error", code: 500 };
    }

    const lastestAmount = this.walletRepo.findWalletByAddress(walletAddress);

    return { message: "success", data: lastestAmount, code: 200 };
  };
}

module.exports = WalletService;
