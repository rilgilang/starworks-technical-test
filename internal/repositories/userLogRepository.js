const { user_logs } = require("../../models");

class UserLogsRepository {
  constructor() {}
  insertLogs = async (payload) => {
    const data = await user_logs.create(payload);
    return data;
  };

  findOneUserLogs = async (userId, browsertype) => {
    const data = await user_logs.findOne({
      where: {
        user_id: userId,
        browser_type: browsertype,
      },
    });

    return data;
  };

  updateUserLogs = async (payload, userId, browsertype) => {
    const data = await user_logs.update(payload, {
      where: {
        user_id: userId,
        browser_type: browsertype,
      },
    });

    return data;
  };
}

module.exports = UserLogsRepository;
