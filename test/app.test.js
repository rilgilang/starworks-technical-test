const request = require("supertest");
const app = require("../app");

const UserRepository = require("../internal/repositories/userRepository");
const WalletRepository = require("../internal/repositories/walletRepository");
const { redisBootStrap } = require("../bootstrap/redis");
const Redis = require("../internal/pkg/redis");
const TransactionRepository = require("../internal/repositories/transactionRepository");
const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const transactionRepo = new TransactionRepository();

beforeAll(async () => {
  const redis = new Redis(redisBootStrap);
  const keys = await redis.getKeys("session:*");
  if (keys.length > 0) {
    await redis.delete(keys);
  }
  await userRepo.destroyAll();
  await walletRepo.destroyAll();
  await transactionRepo.destroyAll();
});

//Home routes
describe("Common routes", () => {
  it("Home routes", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toEqual(200);
  });

  it("Routes not found", async () => {
    const res = await request(app).get("/false-routes");

    expect(res.statusCode).toEqual(404);
  });
});
