const express = require("express");
const router = express.Router();

const AuthHandler = require("../handler/authHandler");
const AuthService = require("../../service/authService");
const UserRepository = require("../../repositories/userRepository");
const Authenticator = require("../../middleware/auth");
const WalletRepository = require("../../repositories/walletRepository");
const WalletHandler = require("../handler/walletHandler");
const WalletService = require("../../service/walletService");
const TransactionRepository = require("../../repositories/txRepositories");
const Redis = require("../../pkg/redis");
const { redisBootStrap } = require("../../../bootstrap/redis");

//Redis
const redis = new Redis(redisBootStrap);

//Repositories
const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const txRepo = new TransactionRepository();

//Authenticator
const authenticator = new Authenticator(redis);

//Service
const authService = new AuthService(userRepo, walletRepo);
const walletService = new WalletService(walletRepo, txRepo);

//Handlers
const authHandlers = new AuthHandler(authService);
const walletHandler = new WalletHandler(walletService);

router.post("/login", authenticator.signin, authHandlers.loginHandler);
router.post("/register", authHandlers.registerHandler);

router.get("/wallet", authenticator.user, walletHandler.getCurrentUserWallet);
router.post("/wallet/topup", authenticator.user, walletHandler.topUpWallet);

module.exports = router;
