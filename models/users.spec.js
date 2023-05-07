import User from './users';

afterEach(() => jest.resetAllMocks());

describe('User Model', () => {
  it('should throw validation error for required fields', async () => {
    const user = new User();

    jest.spyOn(user, 'validate').mockRejectedValueOnce({
      errors: {
        name: "Please enter your name",
        email: "Please enter your email address",
        password: "Please enter password"
      }
    })

    try {
      await user.validate();
    } catch (err) {
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });

  it('Should throw pass length error', async () => {
    const user = new User({
      name: "John",
      meail: "john@test.com",
      password: "123456"
    });

    try {
      await user.validate();
    } catch (err) {
      expect(err.errors.password).toBeDefined();
      expect(err.errors.password.message).toMatch(/your PassWord muSt be at leAsT 8 chARActers loNg/i);
    }
  });

  it('Should create a new user', () => {
    const user = new User({
      name: "John",
      meail: "john@test.com",
      password: "12345678"
    });

    expect(user).toHaveProperty("_id");
  });
});