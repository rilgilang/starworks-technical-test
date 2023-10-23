"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_logs.init(
    {
      user_id: DataTypes.STRING,
      wallet_address: DataTypes.STRING,
      registered_at: DataTypes.DATE,
      browser_type: DataTypes.STRING,
      login_succes: DataTypes.INTEGER,
      login_failed: DataTypes.INTEGER,
      last_seen: DataTypes.DATE,
      last_attemp: DataTypes.ENUM("login_succes", "login_failed"),
    },
    {
      sequelize,
      modelName: "user_logs",
    }
  );
  return user_logs;
};
