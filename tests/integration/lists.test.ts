import request from 'supertest';
import appInstance from '../../../src/app';
import { createTestList, createTestTask } from '../../fixtures/testData';
import { TaskPriority } from '../../../src/models/Task';

// Get the express app from the App instance
const app = appInstance.app;

describe('List API Integration Tests', () => {
  describe('POST /api/lists', () => {
    it('should create a new list', async () => {
      const listData = createTestList({
        name: 'Integration Test List',
        description: 'A list created in integration tests',
      });

      const response = await request(app)
        .post('/api/lists')
        .send(listData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(listData.name);
      expect(response.body.data.description).toBe(listData.description);
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
      expect(response.body.data.tasks).toEqual([]);
    });

    it('should return 400 for invalid list data', async () => {
      const invalidData = {
        name: '', // Empty name should be invalid
        description: 'Invalid list',
      };

      const response = await request(app)
        .post('/api/lists')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should create a list without description', async () => {
      const listData = {
        name: 'List Without Description',
      };

      const response = await request(app)
        .post('/api/lists')
        .send(listData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(listData.name);
      expect(response.body.data.description).toBeNull();
    });
  });

  describe('GET /api/lists', () => {
    it('should return empty array when no lists exist', async () => {
      const response = await request(app)
        .get('/api/lists')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all lists', async () => {
      // Create some lists first
      const list1Data = createTestList({ name: 'List 1' });
      const list2Data = createTestList({ name: 'List 2' });

      await request(app)
        .post('/api/lists')
        .send(list1Data);

      await request(app)
        .post('/api/lists')
        .send(list2Data);

      const response = await request(app)
        .get('/api/lists')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('List 1');
      expect(response.body.data[1].name).toBe('List 2');
    });
  });

  describe('GET /api/lists/:id', () => {
    it('should return a specific list by ID', async () => {
      // Create a list first
      const listData = createTestList({ name: 'Specific List' });
      const createResponse = await request(app)
        .post('/api/lists')
        .send(listData);

      const listId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/lists/${listId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(listId);
      expect(response.body.data.name).toBe(listData.name);
    });

    it('should return 404 for non-existent list', async () => {
      const response = await request(app)
        .get('/api/lists/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/lists/:id', () => {
    it('should update an existing list', async () => {
      // Create a list first
      const listData = createTestList({ name: 'Original Name' });
      const createResponse = await request(app)
        .post('/api/lists')
        .send(listData);

      const listId = createResponse.body.data.id;

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/lists/${listId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(listId);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent list', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/lists/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid update data', async () => {
      // Create a list first
      const listData = createTestList({ name: 'Test List' });
      const createResponse = await request(app)
        .post('/api/lists')
        .send(listData);

      const listId = createResponse.body.data.id;

      const invalidData = {
        name: '', // Empty name should be invalid
      };

      const response = await request(app)
        .put(`/api/lists/${listId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/lists/:id', () => {
    it('should delete an existing list', async () => {
      // Create a list first
      const listData = createTestList({ name: 'List to Delete' });
      const createResponse = await request(app)
        .post('/api/lists')
        .send(listData);

      const listId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/lists/${listId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify the list is deleted
      await request(app)
        .get(`/api/lists/${listId}`)
        .expect(404);
    });

    it('should return 404 for non-existent list', async () => {
      const response = await request(app)
        .delete('/api/lists/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/lists')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/lists')
        .send('name=test')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
