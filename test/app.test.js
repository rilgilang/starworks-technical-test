const request = require("supertest");
const app = require("../app");

const UserRepository = require("../internal/repositories/userRepository");
const WalletRepository = require("../internal/repositories/walletRepository");
const userRepo = new UserRepository();
const walletRepo = new WalletRepository();

beforeAll(async () => {
  await userRepo.destroyAll();
  await walletRepo.destroyAll();
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
