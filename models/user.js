"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init(
    {
      username: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 10));
        },
      },
      email: DataTypes.STRING,
      fist_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      dob: DataTypes.DATE,
      street_address: DataTypes.STRING,
      city: DataTypes.STRING,
      province: DataTypes.STRING,
      telephone_number: DataTypes.INTEGER,
    },
    {
      sequelize,
      paranoid: true, // enable soft delete (deletedAt)
      timestamps: true, // enable createdAt and updatedAt
      modelName: "user",
    }
  );
  return user;
};
