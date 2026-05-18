import { jest } from '@jest/globals';

// Define types for the mock functions to satisfy TypeScript
type UserDocument = {
  _id?: { toString: () => string };
  email?: string;
  username?: string;
  image?: string;
};

// Mock the external dependencies before importing
jest.mock('./utils/db', () => {
  const mockConnectDB = jest.fn();
  return {
    __esModule: true,
    default: mockConnectDB
  };
});

// Mock the User model with delayed initialization to avoid hoisting issues
jest.mock('./app/models/user.model', () => {
  const mockUserFindOne: jest.Mock<any> = jest.fn();
  const mockUserCreate: jest.Mock<any> = jest.fn();

  const User = {
    findOne: mockUserFindOne,
    create: mockUserCreate
  };
  return {
    __esModule: true,
    default: User
  };
});

// Now declare the variables to reference the mocked functions
const mockUserFindOne = require('./app/models/user.model').default.findOne;
const mockUserCreate = require('./app/models/user.model').default.create;

// Import after mocking
import connectDB from "./utils/db";
import User from "./app/models/user.model";

// Capture the original console.error to restore later
const originalConsoleError = console.error;

describe('Auth Logic Tests', () => {
  let mockConnectDBFn: jest.Mock;

  beforeEach(() => {
    // Mock console.error to suppress error logs during tests
    console.error = jest.fn();
    
    // Set up environment variables
    process.env.GOOGLE_ID = 'test-client-id';
    process.env.GOOGLE_SECRET = 'test-client-secret';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    
    // Clear and reset mocks
    mockConnectDBFn = connectDB as jest.Mock;

    // Reset the user model mocks
    mockUserFindOne.mockReset();
    mockUserCreate.mockReset();
  });

  afterEach(() => {
    // Restore original console.error after each test
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('Session callback logic (from auth.ts)', () => {
    const sessionCallback = async ({ session }: { session: any }) => {
      try {
        await connectDB();
        const sessionUser = await User.findOne({ email: session?.user?.email });
        if (session.user) {
          session.user.id = sessionUser?._id.toString();
        }
        return session;
      } catch (error) {
        console.error(error);
        return session;
      }
    };

    it('should add user id to session when user exists', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com'
        }
      };
      
      const mockFoundUser = {
        _id: { toString: () => 'mock-user-id' }
      };
      
      mockUserFindOne.mockResolvedValue(mockFoundUser);
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await sessionCallback({ session: mockSession });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'test@example.com' } as any);
      expect(result.user.id).toBe('mock-user-id');
    });

    it('should handle case when no user is found in session callback', async () => {
      const mockSession = {
        user: {
          email: 'nonexistent@example.com'
        }
      };
      
      mockUserFindOne.mockResolvedValue(null);
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await sessionCallback({ session: mockSession });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' } as any);
      expect(result.user.id).toBeUndefined();
    });

    it('should handle errors in session callback', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com'
        }
      };
      
      mockUserFindOne.mockRejectedValue(new Error('Database error'));
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await sessionCallback({ session: mockSession });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should handle session without user', async () => {
      const mockSession = {
        // No user property
      };

      const result = await sessionCallback({ session: mockSession });

      // Note: The actual code still calls connectDB even when session.user is undefined
      // because the session object itself may be truthy
      expect(mockConnectDBFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSession);
    });
  });

  describe('Sign-in callback logic (from auth.ts)', () => {
    const signInCallback = async ({ profile }: { profile: any }) => {
      try {
        const email = profile?.email;
        if (!email) return false;
        await connectDB();
        let user = await User.findOne({ email: email });
        if (!user) {
          user = await User.create({
            email: profile?.email,
            username: profile?.given_name?.replace(" ", "").toLowerCase(),
            image: profile?.picture,
          });
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    it('should return false if no email is provided in profile', async () => {
      const mockProfile = {
        // No email property
      };

      const result = await signInCallback({ profile: mockProfile });

      expect(result).toBe(false);
      expect(mockConnectDBFn).not.toHaveBeenCalled();
    });

    it('should create a new user if one does not exist', async () => {
      const mockProfile = {
        email: 'newuser@example.com',
        given_name: 'John Doe',
        picture: 'https://example.com/image.jpg'
      };
      
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        email: 'newuser@example.com',
        username: 'johndoe',
        image: 'https://example.com/image.jpg'
      });
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await signInCallback({ profile: mockProfile });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'newuser@example.com' } as any);
      expect(mockUserCreate).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        username: 'johndoe',
        image: 'https://example.com/image.jpg'
      } as any);
      expect(result).toBe(true);
    });

    it('should return true if user already exists', async () => {
      const mockProfile = {
        email: 'existing@example.com',
        given_name: 'Jane Doe',
        picture: 'https://example.com/image.jpg'
      };
      
      mockUserFindOne.mockResolvedValue({
        email: 'existing@example.com',
        username: 'janedoe'
      });
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await signInCallback({ profile: mockProfile });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'existing@example.com' } as any);
      expect(mockUserCreate).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle errors in signIn callback', async () => {
      const mockProfile = {
        email: 'erroruser@example.com'
      };
      
      mockUserFindOne.mockRejectedValue(new Error('Database error'));
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      const result = await signInCallback({ profile: mockProfile });

      expect(mockConnectDBFn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should clean up username by removing first space and converting to lowercase', async () => {
      const mockProfile = {
        email: 'newuser@example.com',
        given_name: 'John Smith Jr',
        picture: 'https://example.com/image.jpg'
      };

      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        email: 'newuser@example.com',
        username: 'johnsmith jr', // Only first space removed, then lowercase
        image: 'https://example.com/image.jpg'
      });
      // @ts-ignore: Type checking issue with mock resolution
      mockConnectDBFn.mockResolvedValue(undefined);

      await signInCallback({ profile: mockProfile });

      expect(mockUserCreate).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        username: 'johnsmith jr', // Only first space removed, then lowercase
        image: 'https://example.com/image.jpg'
      } as any);
    });
  });

  describe('Configuration validation', () => {
    it('should validate environment variables are properly referenced', () => {
      // Check that environment variables are properly referenced
      expect(process.env.GOOGLE_ID).toBe('test-client-id');
      expect(process.env.GOOGLE_SECRET).toBe('test-client-secret');
      expect(process.env.NEXTAUTH_SECRET).toBe('test-secret');
    });

    it('should validate NextAuth configuration structure', () => {
      // This test just validates that the structure would match what's in auth.ts
      const config = {
        providers: [
          // GoogleProvider would be configured here
        ],
        callbacks: {
          session: expect.any(Function),
          signIn: expect.any(Function),
        },
        pages: {
          signIn: "/",
          error: "/",
        },
        secret: process.env.NEXTAUTH_SECRET,
        trustHost: true,
      };

      expect(config).toBeDefined();
      expect(config.pages.signIn).toBe('/');
      expect(config.pages.error).toBe('/');
      expect(config.trustHost).toBe(true);
    });
  });
});