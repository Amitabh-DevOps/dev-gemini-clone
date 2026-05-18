describe('Database Connection Utility', () => {
  const originalEnv = process.env;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset modules to ensure fresh state
    jest.resetModules();

    // Now re-mock mongoose after resetting modules
    jest.mock('mongoose', () => ({
      set: jest.fn(),
      connect: jest.fn(),
    }));

    // Reset mocks
    jest.clearAllMocks();

    // Reset environment
    process.env = { ...originalEnv };

    // Set up console spies inside beforeEach to avoid cross-test interference
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('connectDB', () => {
    it('should connect to MongoDB successfully when MONGODB_URI is valid', async () => {
      // Import connectDB fresh each time to get the fresh module state
      const { default: connectDB } = require('./db');

      // Set a valid MongoDB URI for testing
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

      const mongooseModule = require('mongoose');
      const connectSpy = mongooseModule.connect as jest.Mock;
      const setSpy = mongooseModule.set as jest.Mock;

      await expect(connectDB()).resolves.not.toThrow();

      expect(setSpy).toHaveBeenCalledWith('strictQuery', true);
      expect(connectSpy).toHaveBeenCalledWith(process.env.MONGODB_URI, {
        dbName: 'devgemini',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith('MongoDB is now connected');
    });

    it('should throw an error when MONGODB_URI is not set', async () => {
      // Import connectDB fresh each time to get the fresh module state
      const { default: connectDB } = require('./db');

      // Remove MONGODB_URI from environment
      delete process.env.MONGODB_URI;

      const mongooseModule = require('mongoose');
      const connectSpy = mongooseModule.connect as jest.Mock;
      connectSpy.mockImplementation(() => {
        throw new Error('Invalid connection string');
      });

      await expect(connectDB()).rejects.toThrow('MongoDB connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect to MongoDB', expect.any(Error));
    });

    it('should handle connection errors gracefully', async () => {
      // Import connectDB fresh each time to get the fresh module state
      const { default: connectDB } = require('./db');

      process.env.MONGODB_URI = 'mongodb://invalid:27017/testdb';

      // Mock mongoose.connect to reject with an error
      const mockError = new Error('Connection failed');
      const mongooseModule = require('mongoose');
      const connectSpy = mongooseModule.connect as jest.Mock;
      connectSpy.mockRejectedValue(mockError);

      await expect(connectDB()).rejects.toThrow('MongoDB connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to connect to MongoDB', mockError);
    });

    it('should set strictQuery to true', async () => {
      // Import connectDB fresh each time to get the fresh module state
      const { default: connectDB } = require('./db');

      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

      const mongooseModule = require('mongoose');
      const setSpy = mongooseModule.set as jest.Mock;
      const connectSpy = mongooseModule.connect as jest.Mock;

      await connectDB();

      expect(setSpy).toHaveBeenCalledWith('strictQuery', true);
    });

    it('should log info when already connected', async () => {
      // Import connectDB fresh each time to get the fresh module state
      const { default: connectDBFirst } = require('./db');
      const { default: connectDBSecond } = require('./db');

      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';

      const mongooseModule = require('mongoose');
      const connectSpy = mongooseModule.connect as jest.Mock;

      // First connection
      await connectDBFirst();

      // Clear console info calls from the first connection
      consoleInfoSpy.mockClear();

      // Second connection attempt - should detect it's already connected
      await connectDBSecond();

      // Connect should not be called again
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith('MongoDB is already connected');
    });
  });
});