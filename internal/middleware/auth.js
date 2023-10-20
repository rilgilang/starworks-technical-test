const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const validator = require("validator");
const UserRepository = require("../repositories/userRepository");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

class Authenticator {
  constructor() {}
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

    passport.authenticate("signin", { session: false }, async (err, user) => {
      if (err == "user not found") {
        return res
          .status(401)
          .json({ code: 401, error: err.message, message: "unauthorize" });
      }
      if (err == "password wrong") {
        return res.status(401).json({ code: 401, message: "unauthorize" });
      }

      const jwt = require("jsonwebtoken");
      const identity = { user: user.id };

      const token = await jwt.sign(identity, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      req.user = user;
      req.token = token;
      next();
    })(req, res, next);
  };

  user = (req, res, next) => {
    passport.authorize("user", { session: false }, (err, user, info) => {
      if (err) {
        return res.status(403).json({ message: err.message, statusCode: 403 });
      }
      if (!user) {
        return res.status(403).json({ message: info.message, statusCode: 403 });
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
