"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  wallet.init(
    {
      wallet_address: DataTypes.STRING,
      balance: DataTypes.FLOAT,
    },
    {
      sequelize,
      timestamps: true, // enable createdAt and updatedAt
      modelName: "wallet",
    }
  );
  return wallet;
};
