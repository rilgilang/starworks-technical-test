const validator = require("validator");

class AuthHandler {
  constructor(authService, redis) {
    this.authService = authService;
  }

  loginHandler = async (req, res) => {
    try {
      return res.status(200).json({
        code: 200,
        data: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          dob: req.user.dob,
          city: req.user.city,
          street_address: req.user.street_address,
          province: req.user.province,
          telephone_number: req.user.telephone_number,
          token: req.token,
        },
        message: "success",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, error: error, message: "internal server error" });
    }
  };

  registerHandler = async (req, res) => {
    try {
      const errorMessages = [];

      const validate = [
        "username",
        "password",
        "email",
        "first_name",
        "last_name",
        "dob",
        "street_address",
        "city",
        "province",
        "telephone_number",
      ];

      validate.map((x) => {
        if (!req.body[x] || req.body[x] === "") {
          errorMessages.push(`${x} cannot be empty`);
        }
      });

      if (errorMessages.length > 0) {
        return res
          .status(400)
          .json({ code: 400, error: errorMessages, message: "bad request" });
      }

      if (!validator.isDate(req.body.dob)) {
        return res.status(400).json({
          code: 400,
          error: "dob is not a date with format 2002-07-15",
          message: "bad request",
        });
      }

      if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({
          code: 400,
          error: "email is not valid",
          message: "bad request",
        });
      }

      if (!validator.isMobilePhone(req.body.telephone_number, "id-ID")) {
        return res.status(400).json({
          code: 400,
          error: "telephone_number must be a mobile phone number",
          message: "bad request",
        });
      }

      const max20Validator = ["username", "first_name", "last_name", "city"];

      max20Validator.map((x) => {
        if (!validator.isLength(req.body[x], { min: 2, max: 20 })) {
          errorMessages.push(`${x} must be length min 2 and max 20`);
        }
      });

      if (errorMessages.length > 0) {
        return res.status(400).json({
          code: 400,
          error: errorMessages.length == 1 ? errorMessages[0] : errorMessages,
          message: "bad request",
        });
      }

      if (!validator.isLength(req.body.street_address, { min: 5, max: 40 })) {
        return res.status(400).json({
          code: 400,
          error: "street_address must be min 5 and max 40!",
          message: "bad request",
        });
      }

      const payload = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        dob: req.body.dob,
        street_address: req.body.street_address,
        city: req.body.city,
        province: req.body.province,
        telephone_number: req.body.telephone_number,
      };

      const result = await this.authService.register(payload);

      if (result.code != 201) {
        return res.status(result.code).json({
          code: result.code,
          error: result.error,
          message: result.message,
        });
      }

      return res.status(201).json({
        code: result.code,
        data: {
          id: result.data.id,
          email: result.data.email,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          dob: result.data.dob,
          city: result.data.city,
          street_address: result.data.street_address,
          province: result.data.province,
          telephone_number: result.data.telephone_number,
          username: result.data.username,
        },
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        error: error,
        message: "internal server error",
      });
    }
  };
}

module.exports = AuthHandler;
