const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const validator = require("validator");
const UserRepository = require("../repositories/userRepository");
const DeviceDetector = require("node-device-detector");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

class Authenticator {
  constructor(redis) {
    this.redis = redis;
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
      if (err == "user not found") {
        return res
          .status(401)
          .json({ code: 401, error: err.message, message: "unauthorize" });
      }
      if (err == "password wrong") {
        return res.status(401).json({ code: 401, message: "unauthorize" });
      }
      const userAgent = req.get("User-Agent");
      const jwt = require("jsonwebtoken");
      const identity = { user: user.id };

      const token = await jwt.sign(identity, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      const device = detector.detect(userAgent);

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
        5 * 60
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
          return done("user not found", false);
        }

        const validate = await bcrypt.compare(password, data.password);
        if (!validate) {
          return done("password wrong", false);
        }
        return done(null, data, { message: "Login success!" });
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
