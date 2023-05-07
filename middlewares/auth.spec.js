import jwt from "jsonwebtoken";
import User from "../models/users.js";

import { isAuthenticatedUser } from './auth';

const mockUser = {
  _id: "6453a46d8379ab23e4d5bbbd",
  name: 'Test User',
  email: 'test@gmail.com',
  password: 'hashedPassword'
};

const mockRequest = () => {
  return {
    headers: {
      authorization: "Bearer"
    }
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
};

const mockNext = jest.fn();

describe('AUthentication Middleware', () => {
  it('should throw missing authorization header error', async () => {
    const mockReq = (mockRequest().headers = { headers: {} });
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Missing Authorization header with Bearer token" });
  });

  it('Shuld throw missing JWT error', async () => {
    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Authentication Failed" });
  });

  it("should authenticate the user", async () => {
    jest.spyOn(jwt, 'verify').mockResolvedValueOnce({ id: mockUser._id });
    jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser)

    const mockReq = mockRequest().headers = {
      headers: { authorization: 'Bearer token' }
    };
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);
    expect(mockNext).toBeCalledTimes(1);
  });
});