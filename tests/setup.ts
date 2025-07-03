import { DatabaseConnection } from '../src/config/database';

/**
 * Global test setup
 */
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = ':memory:'; // Use in-memory database for tests
  
  // Connect to test database
  const db = DatabaseConnection.getInstance();
  await db.connect();
});

afterAll(async () => {
  // Close database connection
  const db = DatabaseConnection.getInstance();
  await db.close();
});

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
