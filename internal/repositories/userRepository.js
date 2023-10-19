const { user } = require("../../models");
const { Op } = require("sequelize");

class UserRepository {
  constructor() {}
  findOneByUsernameOrEmail = async (username) => {
    const data = await user.findOne({
      where: {
        [Op.or]: [{ email: username }, { username: username }],
      },
    });

    return data;
  };

  findOneByUsername = async (username) => {
    const data = await user.findOne({
      where: {
        username: username,
      },
    });

    return data;
  };

  findOneByEmail = async (email) => {
    const data = await user.findOne({
      where: {
        email: email,
      },
    });

    return data;
  };

  createNewUser = async (payload) => {
    const data = await user.create(payload);

    return data;
  };
}

module.exports = UserRepository;
