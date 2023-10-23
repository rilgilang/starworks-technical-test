const express = require("express");
const router = express.Router();

const AuthHandler = require("../handler/authHandler");
const AuthService = require("../../service/authService");
const UserRepository = require("../../repositories/userRepository");
const Authenticator = require("../../middleware/auth");

const WalletHandler = require("../handler/walletHandler");
const WalletService = require("../../service/walletService");
const TxRepository = require("../../repositories/txRepositories");
const Redis = require("../../pkg/redis");
const { redisBootStrap } = require("../../../bootstrap/redis");
const TransactionRepository = require("../../repositories/transactionRepository");
const TransactionService = require("../../service/transactionService");
const WalletRepository = require("../../repositories/walletRepository");
const TransactionHandler = require("../handler/transactionHandler");
const UserLogsRepository = require("../../repositories/userLogRepository");
const UserLogsService = require("../../service/userLogsService");

//Redis
const redis = new Redis(redisBootStrap);

//Repositories
const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const transactionRepo = new TransactionRepository();
const txRepo = new TxRepository();
const userLogsRepo = new UserLogsRepository();

//Service
const authService = new AuthService(userRepo, walletRepo);
const walletService = new WalletService(
  walletRepo,
  transactionRepo,
  redis,
  txRepo
);
const userLogsService = new UserLogsService(walletRepo, userLogsRepo);

const transactionService = new TransactionService(
  walletRepo,
  transactionRepo,
  redis,
  txRepo
);

//Authenticator
const authenticator = new Authenticator(redis, userLogsService, walletRepo);

//Handlers
const authHandlers = new AuthHandler(authService);
const walletHandler = new WalletHandler(walletService);
const transactionHandler = new TransactionHandler(transactionService);

router.post("/login", authenticator.signin, authHandlers.loginHandler);
router.post("/register", authHandlers.registerHandler);

router.get("/wallet", authenticator.user, walletHandler.getCurrentUserWallet);
router.post("/wallet/topup", authenticator.user, walletHandler.topUpWallet);

router.post("/pay", authenticator.user, transactionHandler.payment);
router.post(
  "/pay/confirm",
  authenticator.user,
  transactionHandler.confirmPayment
);

module.exports = router;
