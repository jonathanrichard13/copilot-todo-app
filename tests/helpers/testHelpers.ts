import request from 'supertest';
import express from 'express';
import { DatabaseConnection } from '../../src/config/database';

/**
 * Test helper functions
 */

/**
 * Create a test database connection using in-memory SQLite
 */
export const createTestDatabase = async (): Promise<DatabaseConnection> => {
  const db = DatabaseConnection.getInstance();
  await db.connect();
  return db;
};

/**
 * Clear all data from test database
 */
export const clearTestDatabase = async (): Promise<void> => {
  const db = DatabaseConnection.getInstance();
  await db.query('DELETE FROM tasks');
  await db.query('DELETE FROM lists');
};

/**
 * Create a test Express app
 */
export const createTestApp = (): express.Application => {
  const app = express();
  
  // Add basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
};

/**
 * Make authenticated request helper
 */
export const makeRequest = (app: express.Application) => {
  return request(app);
};

/**
 * Assert response structure helper
 */
export const expectApiResponse = (response: any, status: number = 200) => {
  expect(response.status).toBe(status);
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('message');
  expect(response.body).toHaveProperty('data');
  expect(response.body).toHaveProperty('error');
  
  if (status >= 200 && status < 300) {
    expect(response.body.success).toBe(true);
    expect(response.body.error).toBeNull();
  } else {
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeNull();
  }
};

/**
 * Sleep helper for async tests
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate unique test ID
 */
export const generateTestId = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Test date helpers
 */
export const testDates = {
  yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000),
  today: new Date(),
  tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000),
  nextWeek: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  nextMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};
