// Mock for next-auth/jwt
module.exports = {
  __esModule: true,
  JWT: jest.fn(),
  encode: jest.fn(),
  decode: jest.fn(),
};