const { walletAddressGenerator } = require("../helper/walletAddressGenerator");

class UserLogsService {
  constructor(walletRepo, userLogsRepo) {
    this.walletRepo = walletRepo;
    this.userLogsRepo = userLogsRepo;
  }

  loginFailed = async (userId, username, email, device) => {
    const userLogs = await this.userLogsRepo.findOneUserLogs(
      userId,
      `${device.client.name}/${device.client.version}`
    );

    const walletAddress = await walletAddressGenerator(username, email);

    //insert to logs
    if (userLogs) {
      this.updateUserLogs(
        walletAddress,
        userLogs.login_succes,
        userLogs.login_failed + 1,
        userId,
        `${device.client.name}/${device.client.version}`,
        false
      );
    } else {
      this.createNewUserLogs(
        userId,
        walletAddress,
        0,
        1,
        `${device.client.name}/${device.client.version}`,
        false
      );
    }
  };
  loginSuccess = async (userId, username, email, device) => {
    const userLogs = await this.userLogsRepo.findOneUserLogs(
      userId,
      `${device.client.name}/${device.client.version}`
    );

    const walletAddress = await walletAddressGenerator(username, email);

    if (userLogs) {
      this.updateUserLogs(
        walletAddress,
        userLogs.login_succes + 1,
        userLogs.login_failed,
        userId,
        `${device.client.name}/${device.client.version}`,
        true
      );
    } else {
      this.createNewUserLogs(
        userId,
        walletAddress,
        0,
        1,
        `${device.client.name}/${device.client.version}`,
        false
      );
    }
  };
  createNewUserLogs = async (
    userId,
    walletAddress,
    loginSuccess,
    loginFailed,
    browserType,
    status
  ) => {
    //if user first time login with new browser
    await this.userLogsRepo.insertLogs({
      user_id: userId,
      wallet_address: walletAddress,
      browser_type: browserType,
      login_succes: loginSuccess,
      login_failed: loginFailed,
      last_seen: Date.now(),
      last_attemp: status ? "login_succes" : "login_failed",
    });
  };

  updateUserLogs = async (
    walletAddress,
    loginSuccess,
    loginFailed,
    userId,
    browserType,
    status
  ) => {
    let payload;
    if (status === true) {
      payload = {
        wallet_address: walletAddress,
        login_succes: loginSuccess,
        login_failed: loginFailed,
        last_attemp: "login_succes",
        last_seen: Date.now(),
      };
    } else {
      payload = {
        wallet_address: walletAddress,
        login_succes: loginSuccess,
        login_failed: loginFailed,
        last_attemp: "login_failed",
      };
    }
    //update user logs
    await this.userLogsRepo.updateUserLogs(payload, userId, browserType);
  };
}

module.exports = UserLogsService;
