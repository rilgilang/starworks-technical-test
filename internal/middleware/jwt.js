// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const bcrypt = require("bcrypt");
// const JWTstrategy = require("passport-jwt").Strategy;
// const ExtractJWT = require("passport-jwt").ExtractJwt;

// class JWTAuthenticator {
//   constructor(userRepo) {
//     this.userRepo = userRepo;
//   }
//   authenticate = async (username, password) => {
//     passport.authenticate("signin", { session: false }, (err, user, info) => {
//       if (err) {
//         return { code: 401, message: err.message };
//       }
//       if (!user) {
//         return { code: 401, message: err.message };
//       }
//     });

//     passport.use(
//       new LocalStrategy(async (done) => {
//         try {
//           console.log("ini blok ");
//           const data = await userRepo.findOne(username);
//           if (!data) {
//             // return done(null, false, {
//             //   message: "username or password wrong",
//             // });
//             return done, (null, false);
//           }
//           const validate = await bcrypt.compare(password, data.password);
//           if (!validate) {
//             // return done(null, false, {
//             //   message: "username or password wrong",
//             // });
//             return done, (null, false);
//           }
//           // return done(null, data, { message: "Login success!" });
//           return done(null, data, { message: "Login success!" });
//         } catch (e) {
//           // return done(e, false, { message: "User can't be created" });
//           return done, (e, false);
//         }
//       })
//     );
//   };
// }

// module.exports = JWTAuthenticator;
