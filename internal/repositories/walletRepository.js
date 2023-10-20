const { wallet } = require("../../models");

class WalletRepository {
  constructor() {}
  findWalletByAddress = async (address) => {
    const data = await wallet.findOne({
      where: {
        wallet_address: address,
      },
    });

    return data;
  };

  createNewWallet = async (address) => {
    const data = await wallet.create({
      wallet_address: address,
      balance: 0,
    });

    return data;
  };
}

module.exports = WalletRepository;
