const request = require("supertest");
const app = require("../app");
const UserRepository = require("../internal/repositories/userRepository");

const userRepo = new UserRepository();

const userUrl = "/api/v1";

beforeAll(async () => {
  await userRepo.destroyAll();
});

//Register
describe("Registering", () => {
  it("Register success", async () => {
    const res = await request(app)
      .post(userUrl + "/register")
      .send({
        email: "unittestsuccess@gmail.com",
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
        email: "unittestsuccess@gmail.com",
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
        email: "unittestsuccess@gmail.com",
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
  it("Login success", async () => {
    const res = await request(app)
      .post(userUrl + "/login")
      .send({
        username: "username",
        password: "password",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Login failed user not found", async () => {
    const res = await request(app)
      .post(userUrl + "/login")
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
      .send({
        username: "username",
        password: "wrong password",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});
