const express = require("express");
const router = express.Router();

const AuthHandler = require("../handler/authHandler");
const AuthService = require("../../service/authService");
const UserRepository = require("../../repositories/userRepository");
const { signin } = require("../../middleware/auth");
const Authenticator = require("../../middleware/auth");

//Database

//Repositories
const userRepo = new UserRepository();

//Authenticator
const authenticator = new Authenticator();

//Service
const authService = new AuthService(userRepo);

//Handlers
const authHandlers = new AuthHandler(authService);

router.post("/login", authenticator.signin, authHandlers.loginHandler);
router.post("/register", authHandlers.registerHandler);

module.exports = router;
