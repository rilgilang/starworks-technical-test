const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const validator = require("validator");
const UserRepository = require("../repositories/userRepository");
const DeviceDetector = require("node-device-detector");
const { walletAddressGenerator } = require("../helper/walletAddressGenerator");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

class Authenticator {
  constructor(redis, userLogsRepo, walletRepo) {
    this.redis = redis;
    this.userLogsRepo = userLogsRepo;
    this.walletRepo = walletRepo;
  }

  signin = async (req, res, next) => {
    const errorMessages = [];
    const validate = ["username", "password"];

    validate.map((x) => {
      if (
        !req.body[x] ||
        req.body[x] === "" ||
        validator.isEmpty(`${req.body[x]}`)
      ) {
        errorMessages.push(`${x} cannot be empty`);
      }
    });

    if (errorMessages.length > 0) {
      return res.status(400).json({ message: errorMessages });
    }

    if (!validator.matches(req.body.username, /^[a-z0-9_\.]+$/)) {
      errorMessages.push(`username can'contain special char`);
    }

    if (errorMessages.length > 0) {
      return res.status(400).json({
        message: errorMessages.length == 1 ? errorMessages[0] : errorMessages,
      });
    }

    passport.authenticate("signin", { session: false }, async (err, user) => {
      if (err.error == "user not found") {
        return res
          .status(401)
          .json({ code: 401, error: err.message, message: "unauthorize" });
      }

      const userAgent = req.get("User-Agent");
      const device = detector.detect(userAgent);

      user = {
        id: user === undefined ? err.user.id : user.id,
        username: user === undefined ? err.user.username : user.username,
        email: user === undefined ? err.user.email : user.email,
        createdAt: user === undefined ? err.user.createdAt : user.createdAt,
      };

      const userLogs = await this.userLogsRepo.findOneUserLogs(
        user.id,
        user.username,
        `${device.client.name}/${device.client.version}`
      );

      const walletAddress = await walletAddressGenerator(
        user.username,
        user.email
      );

      if (err.error == "password wrong") {
        //insert to logs
        if (userLogs) {
          this.updateUserLogs(
            walletAddress,
            userLogs.login_succes,
            userLogs.login_failed + 1,
            user.id,
            `${device.client.name}/${device.client.version}`,
            false
          );
        } else {
          this.createNewUserLogs(
            user,
            walletAddress,
            0,
            1,
            `${device.client.name}/${device.client.version}`,
            false
          );
        }

        return res.status(401).json({ code: 401, message: "unauthorize" });
      }

      if (userLogs) {
        this.updateUserLogs(
          userWallet.balance,
          userLogs.login_succes + 1,
          userLogs.login_failed,
          user.id,
          `${device.client.name}/${device.client.version}`,
          true
        );
      } else {
        this.createNewUserLogs(
          user,
          userWallet.balance,
          1,
          0,
          `${device.client.name}/${device.client.version}`,
          true
        );
      }

      const jwt = require("jsonwebtoken");
      const identity = { user: user.id };

      const token = await jwt.sign(identity, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      const userSession = await this.redis.get(
        `session:${user.id}:(${device.os.name}:${device.os.version})`
      );

      if (userSession) {
        await this.redis.delete(
          `session:${user.id}:(${device.os.name}:${device.os.version})`
        );
      }

      await this.redis.set(
        `session:${user.id}:(${device.os.name}:${device.os.version})`,
        token,
        5 * 60 //TODO set dynamicaly with env
      );

      req.user = user;
      req.token = token;
      next();
    })(req, res, next);
  };

  user = (req, res, next) => {
    passport.authorize("user", { session: false }, async (err, user, info) => {
      if (err) {
        return res.status(403).json({ code: 403, message: err.message });
      }
      if (!user) {
        return res.status(403).json({ code: 403, message: info.message });
      }

      const userAgent = req.get("User-Agent");

      const device = detector.detect(userAgent);

      const userSession = await this.redis.get(
        `session:${user.id}:(${device.os.name}:${device.os.version})`
      );

      if (userSession !== req.headers.authorization.split(" ")[1]) {
        return res.status(403).json({ code: 403, message: "forbidden" });
      }

      req.user = user;
      next();
    })(req, res, next);
  };

  createNewUserLogs = async (
    user,
    walletAddress,
    loginSuccess,
    loginFailed,
    browserType,
    status
  ) => {
    //if user first time login with new browser
    await this.userLogsRepo.insertLogs({
      user_id: user.id,
      wallet_address: walletAddress,
      registered_at: user.createdAt,
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

module.exports = Authenticator;

const userRepo = new UserRepository();

// for sign in
passport.use(
  "signin",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const data = await userRepo.findOneByUsernameOrEmail(username);
        if (!data) {
          return done({ error: "user not found", user: null }, false);
        }

        const validate = await bcrypt.compare(password, data.password);
        if (!validate) {
          return done({ error: "password wrong", user: data }, false);
        }
        return done(null, data);
      } catch (e) {
        return done("user cant login!", false);
      }
    }
  )
);

//permit for user
passport.use(
  "user",
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        const data = await userRepo.findOneById(token.user);

        if (data) {
          return done(null, data);
        }

        return done(null, false, { message: "access denied" });
      } catch (error) {
        return done(error, false, { message: "access denied" });
      }
    }
  )
);
