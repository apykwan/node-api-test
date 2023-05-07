import bcrypt from 'bcryptjs';

import User from '../models/users';
import { registerUser, loginUser } from './authController';
import * as jwt from '../utils/helpers';

const mockRequest = () => {
  return {
    body: {
      name: 'Test User',
      email: 'test@gmail.com',
      password: '12345678'
    }
  }
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const mockUser = {
  _id: "6453a46d8379ab23e4d5bbbd",
  name: 'Test User',
  email: 'test@gmail.com',
  password: 'hashedPassword'
};

const userLogin = {
  email: 'test@gmail.com',
  password: '12345678'
};

afterEach(() => {
  // restore the spy created with spyOn
  jest.restoreAllMocks();
});

describe('Register User and return token', () => {
  it("should register user and return token", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockResolvedValueOnce(mockUser);
    jest.spyOn(jwt, "getJwtToken").mockResolvedValueOnce('jwt_token');

    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 10);
    expect(User.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'hashedPassword'
    });
    expect(mockRes.json).toHaveBeenCalledWith({ token: 'jwt_token' });
  });

  it('It should throw validation error', async () => {
    const mockReq = (mockRequest().body = { body: {} });
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Please enter all values" });
  });

  it('should throw duplicated email entered error', async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockRejectedValueOnce({ code: 11000 });

    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Duplicate email" });
  });
});

describe('Login user', () => {
  it("should throw missing email error", async () => {
    const mockReq = (mockRequest().body = { body: {} } );
    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error:"Please enter email & Password" });
  });

  it("should throw invalid email", async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(null)
    }));

    const mockReq = mockRequest().body = { body: userLogin };
    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid Email or Password" });;
  });

  it("should throw Invalid password error", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

    const mockReq = (mockRequest().body = { body: userLogin });
    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
  });

  it("should return token when login", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
    jest.spyOn(jwt, "getJwtToken").mockResolvedValueOnce('jwt_token');

    const mockReq = (mockRequest().body = { body: userLogin });
    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ token: 'jwt_token' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@gmail.com' });
  });
});