const request = require("supertest");
const app = require("../app");

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
