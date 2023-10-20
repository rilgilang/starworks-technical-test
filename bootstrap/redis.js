require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const { Redis } = require("ioredis");

const redisOptions = {
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  username: process.env.REDIS_USERNAME, // needs Redis >= 6
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB, // Defaults to 0
};

//redis
const redisBootStrap = new Redis(redisOptions);

module.exports = { redisBootStrap };
