class AuthService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
  register = async (payload) => {
    const checkUserByEmail = await this.userRepo.findOneByEmail(payload.email);

    if (checkUserByEmail) {
      return {
        code: 400,
        error: "email already registered!",
        message: "bad request",
      };
    }

    const checkUserByUsername = await this.userRepo.findOneByUsername(
      payload.username
    );

    if (checkUserByUsername) {
      return {
        code: 400,
        error: "user already taken!",
        message: "bad request",
      };
    }

    await this.userRepo.createNewUser(payload);

    const newUser = await this.userRepo.findOneByUsername(payload.username);

    return { message: "success", data: newUser, code: 201 };
  };
}

module.exports = AuthService;
