const request = require("supertest");
const app = require("../app");
const UserRepository = require("../internal/repositories/userRepository");
const jwt = require("jsonwebtoken");
const WalletRepository = require("../internal/repositories/walletRepository");
const {
  walletAddressGenerator,
} = require("../internal/helper/walletAddressGenerator");
const { redisBootStrap } = require("../bootstrap/redis");
const Redis = require("../internal/pkg/redis");

const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const userUrl = "/api/v1";
const dummyUserAgent = "Jest-Testing";
let validToken = "";
let invalidToken = "";

const expiredToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE2OTc3NzUzNTEsImV4cCI6MTY5Nzc3NTY1MX0.ral7oiAin2zFaGHw8KuKyOl-_7_8EQmS31sCbGTkQik";

beforeAll(async () => {
  const redis = new Redis(redisBootStrap);

  //wait to clear all fields in auth.test
  await new Promise((r) => setTimeout(r, 1500));

  await userRepo.createNewUser({
    username: "walletTest",
    password: "walletTest",
    email: "walletTest@gmail.com",
    first_name: "walletTest",
    last_name: "walletTest",
    dob: "1999-09-09",
    street_address: "walletTest",
    city: "walletTest",
    province: "walletTest",
    telephone_number: "6289688262345",
  });

  const walletAddress = await walletAddressGenerator(
    "walletTest",
    "walletTest@gmail.com"
  );

  await walletRepo.createNewWallet(walletAddress);

  const user = await userRepo.findOneByUsername("walletTest");

  //valid user
  validToken = jwt.sign({ user: user.id }, process.env.JWT_SECRET);
  await redis.set(`session:${user.id}:${dummyUserAgent}`, validToken, 5 * 60);

  //invalid user
  invalidToken = jwt.sign({ user: 99 }, process.env.JWT_SECRET);
  await redis.set(`session:${99}:${dummyUserAgent}`, invalidToken, 5 * 60);
});

describe("Wallet", () => {
  it("Get wallet success", async () => {
    const res = await request(app)
      .get(userUrl + "/wallet")
      .set({
        Authorization: `Bearer ${validToken}`,
        "User-Agent": dummyUserAgent,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data.balance).toEqual(0);
  });

  it("Get wallet failed no authorization bearer token", async () => {
    const res = await request(app).get(userUrl + "/wallet");

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Get wallet failed expired authorization bearer token", async () => {
    const res = await request(app)
      .get(userUrl + "/wallet")
      .set({
        Authorization: `Bearer ${expiredToken}`,
        "User-Agent": dummyUserAgent,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Get wallet failed wrong authorization bearer token", async () => {
    const res = await request(app)
      .get(userUrl + "/wallet")
      .set({
        Authorization: `Bearer ${invalidToken}`,
        "User-Agent": dummyUserAgent,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Topup Wallet", () => {
  it("Topup wallet success", async () => {
    const amount = 5000;
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${validToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    // expect(res.body.data.balance).toEqual(lastBalance + amount);
  });

  it("Topup wallet failed expired token", async () => {
    const amount = 5000;
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${expiredToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Topup wallet failed wrong authorization bearer token", async () => {
    const amount = 5000;
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${invalidToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Topup wallet failed amount is empty", async () => {
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${validToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Topup wallet failed amount less than 5000", async () => {
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${validToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: 200,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Topup wallet failed amount more than 1000000", async () => {
    const res = await request(app)
      .post(userUrl + "/wallet/topup")
      .set({
        Authorization: `Bearer ${validToken}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: 2000000,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
});
