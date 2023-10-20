const request = require("supertest");
const app = require("../app");
const { redisBootStrap } = require("../bootstrap/redis");
const Redis = require("../internal/pkg/redis");

const userUrl = "/api/v1";
let expiredToken = "";
const dummyUserAgent = "Jest-Testing";

//******delete this after debugging******
const redis = new Redis(redisBootStrap);
let checkId = 0;
//******delete this after debugging******

beforeAll(async () => {
  await new Promise((r) => setTimeout(r, 1500));

  await request(app)
    .post(userUrl + "/register")
    .send({
      email: "oldtoken@gmail.com",
      first_name: "oldtoken",
      last_name: "oldtoken",
      dob: "2000-01-01",
      city: "ini oldtoken",
      street_address: "jl. uwow oldtoken",
      province: "oldtoken",
      telephone_number: "6289688262345",
      username: "oldtoken",
      password: "oldtoken",
    });

  const res = await request(app)
    .post(userUrl + "/login")
    .set({ "User-Agent": dummyUserAgent })
    .send({
      username: "oldtoken",
      password: "oldtoken",
    });

  //old token
  expiredToken = res.body.data.token;
});

//Register
describe("Registering", () => {
  it("Register success", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "registering@gmail.com",
        first_name: "first",
        last_name: "last",
        dob: "2000-01-01",
        city: "ini city",
        street_address: "jl. uwow sangad",
        province: "province",
        telephone_number: "6289688262345",
        username: "username",
        password: "password",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed email duplicate", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "registering@gmail.com",
        first_name: "first_email_duplicate",
        last_name: "last_email_duplicate",
        dob: "2000-01-01",
        city: "city_email_duplicate",
        street_address: "jl. uwow sangad_email_duplicate",
        province: "province_email_duplicate",
        telephone_number: "6289688262345",
        username: "username_email_duplicate",
        password: "password_email_duplicate",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed one of body empty", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "oneofbodyempty@gmail.com",
        first_name: "",
        last_name: "last_email_duplicate",
        dob: "2000-01-01",
        city: "city_email_duplicate",
        street_address: "jl. uwow sangad_email_duplicate",
        province: "province_email_duplicate",
        telephone_number: "6289688262345",
        username: "oneofbodyempty",
        password: "password_email_duplicate",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed dob is not valid", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "dobnotvalid@gmail.com",
        first_name: "dobnotvalid",
        last_name: "dobnotvalid",
        dob: "invaliddob",
        city: "city_dobnotvalid",
        street_address: "jl. uwow dobnotvalid",
        province: "dobnotvalid",
        telephone_number: "6289688262345",
        username: "dobnotvalid",
        password: "dobnotvalid",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed email is not valid", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "notvalid",
        first_name: "emailisnotvalid",
        last_name: "emailisnotvalid",
        dob: "2000-12-12",
        city: "emailisnotvalid",
        street_address: "jl. uwow emailisnotvalid",
        province: "emailisnotvalid",
        telephone_number: "6289688262345",
        username: "emailisnotvalid",
        password: "emailisnotvalid",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed phone is not valid", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "phonenotvalid@gmail.com",
        first_name: "phonenotvalid",
        last_name: "phonenotvalid",
        dob: "2000-12-12",
        city: "phonenotvalid",
        street_address: "jl. uwow phonenotvalid",
        province: "phonenotvalid",
        telephone_number: "notvalid",
        username: "phonenotvalid",
        password: "phonenotvalid",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed username, first name, last name city length less than 2", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "max20validator@gmail.com",
        first_name: "a",
        last_name: "a",
        dob: "1999-05-22",
        city: "a",
        street_address: "jl. uwow max20validator",
        province: "max20validator",
        telephone_number: "6289688262345",
        username: "a",
        password: "max20validator",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed username, first name, last name city length more than 20", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "max20validator@gmail.com",
        first_name:
          "dTz7GyjYYZH4npJEBjQfYtXyRqCN6gXBErQy45IRbnbSrI67TtERrxdrSMP2",
        last_name:
          "dTz7GyjYYZH4npJEBjQfYtXyRqCN6gXBErQy45IRbnbSrI67TtERrxdrSMP2",
        dob: "1999-05-22",
        city: "dTz7GyjYYZH4npJEBjQfYtXyRqCN6gXBErQy45IRbnbSrI67TtERrxdrSMP2",
        street_address: "jl. uwow max20validator",
        province: "max20validator",
        telephone_number: "6289688262345",
        username:
          "dTz7GyjYYZH4npJEBjQfYtXyRqCN6gXBErQy45IRbnbSrI67TtERrxdrSMP2",
        password: "max20validator",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed address length is less than 5", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "addresslengthnotvalid@gmail.com",
        first_name: "addressisnotvalid",
        last_name: "addressisnotvalid",
        dob: "1999-05-22",
        city: "addressisnotvalid",
        street_address: "a",
        province: "addressisnotvalid",
        telephone_number: "6289688262345",
        username: "addressisnotvalid",
        password: "max20validator",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed address length is more than 40", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "addresslengthnotvalid@gmail.com",
        first_name: "addressisnotvalid",
        last_name: "addressisnotvalid",
        dob: "1999-05-22",
        city: "addressisnotvalid",
        street_address:
          "dTz7GyjYYZH4npJEBjQfYtXyRqCN6gXBErQy45IRbnbSrI67TtERrxdrSMP2",
        province: "addressisnotvalid",
        telephone_number: "6289688262345",
        username: "addressisnotvalid",
        password: "max20validator",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed email already registered", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "registering@gmail.com",
        first_name: "first",
        last_name: "last",
        dob: "2000-01-01",
        city: "ini city",
        street_address: "jl. uwow sangad",
        province: "province",
        telephone_number: "6289688262345",
        username: "username",
        password: "password",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Register failed user already taken", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "useralreadytaken@gmail.com",
        first_name: "first",
        last_name: "last",
        dob: "2000-01-01",
        city: "ini city",
        street_address: "jl. uwow sangad",
        province: "province",
        telephone_number: "6289688262345",
        username: "username",
        password: "password",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
});

//Home routes
describe("Login", () => {
  //login account name "oldtoken" to the new session
  it("Login success", async () => {
    //this will prevent jwt generate same token for expiredToken and token on this response
    await new Promise((r) => setTimeout(r, 1000));
    const res = await request(app)
      .post(userUrl + "/login")
      .set({ "User-Agent": dummyUserAgent })
      .send({
        username: "oldtoken",
        password: "oldtoken",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Login failed user not found", async () => {
    const res = await request(app)
      .post(userUrl + "/login")
      .set({ "User-Agent": dummyUserAgent })
      .send({
        username: "njir_aselole",
        password: "password",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Login failed password or username empty", async () => {
    const res = await request(app)
      .post(userUrl + "/login")
      .set({ "User-Agent": dummyUserAgent })
      .send({
        username: "",
        password: "",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Login failed password is wrong", async () => {
    const res = await request(app)
      .post(userUrl + "/login")
      .set({ "User-Agent": dummyUserAgent })
      .send({
        username: "username",
        password: "wrong password",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("validation old token forbidden when user logged in same device again", async () => {
    const res = await request(app)
      .get(userUrl + "/wallet")
      .set({
        Authorization: `Bearer ${expiredToken}`,
        "User-Agent": dummyUserAgent,
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toBeInstanceOf(Object);
  });
});
