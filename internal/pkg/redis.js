require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

class Redis {
  constructor(client) {
    this.client = client;
  }

  set = async (key, value, expire) => {
    await this.client.set(key, value, "EX", expire);
  };

  get = async (key) => {
    return await this.client.get(key);
  };

  getKeys = async (keyPattern) => {
    return await this.client.keys(keyPattern);
  };

  delete = async (key) => {
    return await this.client.del(key);
  };
}

module.exports = Redis;
