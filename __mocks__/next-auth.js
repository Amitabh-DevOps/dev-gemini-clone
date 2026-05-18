// Mock for next-auth
const mockSession = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockAuth = jest.fn();

module.exports = {
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    signIn: mockSignIn,
    signOut: mockSignOut,
    auth: mockAuth,
  })),
  NextAuth: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    signIn: mockSignIn,
    signOut: mockSignOut,
    auth: mockAuth,
  })),
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut,
};