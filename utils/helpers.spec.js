import jwt from 'jsonwebtoken';
import { getJwtToken, sendEmail } from './helpers';
import nodemailer from "nodemailer";

afterEach(() => jest.resetAllMocks());

describe('util/helpers', () => {
  describe('Send Mail', () => {
    it('should send email to user', async () => {
      jest.spyOn(nodemailer, 'createTransport').mockReturnValueOnce({
        sendMail: jest.fn().mockResolvedValueOnce({
          accepted: ["test@gmail.com"],
        })
      });

      const response = await sendEmail({
        email:  'test@gmail.com',
        subject: 'Password Reset',
        message: 'This is test message'
      });

      expect(response).toBeDefined();
      expect(response).toStrictEqual({ accepted: ["test@gmail.com"] });
      expect(response.accepted).toContain('test@gmail.com');
    });
  });

  describe('JWT Token', () => {
    it('should give JWT token', async () => {
      jest.spyOn(jwt, 'sign').mockResolvedValueOnce('token');

      const token = await getJwtToken('6453a46d8379ab23e4d5bbbd');

      expect(token).toBeDefined();
      expect(token).toBe('token');
    });
  });
});