const request = require("supertest");
const app = require("../app");
const UserRepository = require("../internal/repositories/userRepository");
const jwt = require("jsonwebtoken");
const WalletRepository = require("../internal/repositories/walletRepository");
const {
  walletAddressGenerator,
  pinHashGenerator,
} = require("../internal/helper/walletAddressGenerator");
const { redisBootStrap } = require("../bootstrap/redis");
const Redis = require("../internal/pkg/redis");
const DeviceDetector = require("node-device-detector");

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

const userRepo = new UserRepository();
const walletRepo = new WalletRepository();
const url = "/api/v1";
const dummyUserAgent =
  "Mozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36";
const device = detector.detect(dummyUserAgent);
let token = "";
let walletAddressRecipient = "";
let walletAddressSender = "";
let balance = 500000;
const amount = 5000;
const pin = 123456;
const dummyTransactionId =
  "0b072e5f540a3042064d4131c19c57f36883d2b20cb9dab8a6c0ac73cccb864b";

beforeAll(async () => {
  const redis = new Redis(redisBootStrap);

  //wait to clear all fields in auth.test
  await new Promise((r) => setTimeout(r, 1500));

  await userRepo.createNewUser({
    username: "transactionTestRecipient",
    password: "transactionTestRecipient",
    email: "transactionTestRecipient@gmail.com",
    first_name: "transactionTestRecipient",
    last_name: "transactionTestRecipient",
    dob: "1999-09-09",
    street_address: "transactionTestRecipient",
    city: "transactionTestRecipient",
    province: "transactionTestRecipient",
    telephone_number: "6289688262345",
  });

  walletAddressRecipient = await walletAddressGenerator(
    "transactionTestRecipient",
    "transactionTestRecipient@gmail.com"
  );

  await walletRepo.createNewWallet(walletAddressRecipient);

  //==============================================================================
  await userRepo.createNewUser({
    username: "walletTestSender",
    password: "walletTestSender",
    email: "walletTestSender@gmail.com",
    first_name: "walletTestSender",
    last_name: "walletTestSender",
    dob: "1999-09-09",
    street_address: "walletTestSender",
    city: "walletTestSender",
    province: "walletTestSender",
    telephone_number: "6289688262345",
  });

  walletAddressSender = await walletAddressGenerator(
    "walletTestSender",
    "walletTestSender@gmail.com"
  );

  const hashedPin = await pinHashGenerator(pin);

  await walletRepo.createNewWallet(walletAddressSender, hashedPin);
  await walletRepo.updateBalance(balance, walletAddressSender);

  const user = await userRepo.findOneByUsername("walletTestSender");

  token = jwt.sign({ user: user.id }, process.env.JWT_SECRET);
  await redis.set(
    `session:${user.id}:(${device.os.name}:${device.os.version})`,
    token,
    5 * 60
  );
});

describe("Create Payment", () => {
  it("Create Payment Success", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);

    const checkBallance = await request(app)
      .get(url + "/wallet")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      });

    expect(checkBallance.statusCode).toEqual(200);
    expect(checkBallance.body).toBeInstanceOf(Object);

    balance = res.body.data.balance;
  });

  it("Create Payment failed recipient is empty", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: "",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed recipient address is not valid", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: "woow",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed amount is empty", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed amount not numeric", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: "uwow",
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed amount less than 50000", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: 100,
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed amount more than 1000000", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: 2000000,
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed amount more than 1000000", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: 2000000,
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed insuficient amount", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: balance + 1000,
        recipient: walletAddressRecipient,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Create Payment failed user pay to himself", async () => {
    const res = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressSender,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Confirm Payment", () => {
  it("Confirm payment success", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
        payment_id: payment.body.data.transaction_id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed payment_id is empty", async () => {
    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed payment_id not found", async () => {
    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
        payment_id: "asdadasdasdasda",
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed pin is empty", async () => {
    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        payment_id: dummyTransactionId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed pin not numeric", async () => {
    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: "sadadasd",
        payment_id: dummyTransactionId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed pin not 6 digit", async () => {
    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: 1234,
        payment_id: dummyTransactionId,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed transaction_id not found in redis", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    await new Promise((r) => setTimeout(r, 3100));

    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
        payment_id: payment.body.data.transaction_id,
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed recipient address not found", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
        payment_id: dummyTransactionId,
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed incorrect pin", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: 123789,
        payment_id: payment.body.data.transaction_id,
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed incorrect pin 3 time", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    const attemp1 = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: 123789, //invalid pin
        payment_id: payment.body.data.transaction_id,
      });
    expect(attemp1.statusCode).toEqual(401);
    expect(attemp1.body).toBeInstanceOf(Object);

    const attemp2 = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: 123789, //invalid pin
        payment_id: payment.body.data.transaction_id,
      });

    expect(attemp2.statusCode).toEqual(401);
    expect(attemp2.body).toBeInstanceOf(Object);

    const attemp3 = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: 123789, //invalid pin
        payment_id: payment.body.data.transaction_id,
      });

    expect(attemp3.statusCode).toEqual(401);
    expect(attemp3.body).toBeInstanceOf(Object);
  });

  it("Confirm payment failed recipient insuficient balance", async () => {
    const payment = await request(app)
      .post(url + "/pay")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        amount: amount,
        recipient: walletAddressRecipient,
      });

    await walletRepo.updateBalance(200, walletAddressSender);

    const res = await request(app)
      .post(url + "/pay/confirm")
      .set({
        Authorization: `Bearer ${token}`,
        "User-Agent": dummyUserAgent,
      })
      .send({
        pin: pin,
        payment_id: payment.body.data.transaction_id,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
});
