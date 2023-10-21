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

  createNewWallet = async (address, pin) => {
    const data = await wallet.create({
      wallet_address: address,
      balance: 0,
      pin: pin,
    });

    return data;
  };

  updateBalance = async (amount, walletAddress) => {
    const data = await wallet.update(
      { balance: amount },
      { where: { wallet_address: walletAddress } }
    );

    return data;
  };

  destroyAll = async () => {
    const result = await wallet.destroy({
      where: {},
      truncate: true,
    });

    return result;
  };
}

module.exports = WalletRepository;
