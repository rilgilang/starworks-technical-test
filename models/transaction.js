"use strict";
const uuid = require("uuid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  transactions.init(
    {
      recipient_address: DataTypes.STRING,
      sender_address: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      status: DataTypes.ENUM("sucess", "failed", "pending"),
    },
    {
      sequelize,
      timestamps: true, // enable createdAt and updatedAt
      modelName: "transaction",
    }
  );
  return transactions;
};
