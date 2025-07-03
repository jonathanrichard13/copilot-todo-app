import { MemoryListRepository } from '../../../src/repositories/memory/MemoryListRepository';
import { List } from '../../../src/models/List';
import { testLists, createTestList } from '../../fixtures/testData';
import { generateTestId } from '../../helpers/testHelpers';

describe('MemoryListRepository', () => {
  let repository: MemoryListRepository;

  beforeEach(() => {
    repository = new MemoryListRepository();
  });

  describe('create', () => {
    it('should create a new list successfully', async () => {
      const listData = createTestList({
        name: 'Test List',
        description: 'A test list',
      });

      const createdList = await repository.create(listData);

      expect(createdList).toBeDefined();
      expect(createdList.id).toBeDefined();
      expect(createdList.name).toBe(listData.name);
      expect(createdList.description).toBe(listData.description);
      expect(createdList.createdAt).toBeInstanceOf(Date);
      expect(createdList.updatedAt).toBeInstanceOf(Date);
      expect(createdList.tasks).toEqual([]);
    });

    it('should create multiple lists with unique IDs', async () => {
      const list1 = await repository.create(createTestList({ name: 'List 1' }));
      const list2 = await repository.create(createTestList({ name: 'List 2' }));

      expect(list1.id).not.toBe(list2.id);
      expect(list1.name).toBe('List 1');
      expect(list2.name).toBe('List 2');
    });

    it('should handle lists with no description', async () => {
      const listData = createTestList({
        name: 'List without description',
      });
      // Remove description explicitly
      delete listData.description;

      const createdList = await repository.create(listData);

      expect(createdList.description).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find an existing list by ID', async () => {
      const createdList = await repository.create(createTestList());
      
      const foundList = await repository.findById(createdList.id);

      expect(foundList).toBeDefined();
      expect(foundList!.id).toBe(createdList.id);
      expect(foundList!.name).toBe(createdList.name);
    });

    it('should return null for non-existent list ID', async () => {
      const nonExistentId = generateTestId();
      
      const foundList = await repository.findById(nonExistentId);

      expect(foundList).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no lists exist', async () => {
      const lists = await repository.findAll();

      expect(lists).toEqual([]);
    });

    it('should return all lists', async () => {
      const list1 = await repository.create(createTestList({ name: 'List 1' }));
      const list2 = await repository.create(createTestList({ name: 'List 2' }));
      const list3 = await repository.create(createTestList({ name: 'List 3' }));

      const lists = await repository.findAll();

      expect(lists).toHaveLength(3);
      expect(lists.map(l => l.id)).toContain(list1.id);
      expect(lists.map(l => l.id)).toContain(list2.id);
      expect(lists.map(l => l.id)).toContain(list3.id);
    });

    it('should include tasks in returned lists', async () => {
      const list = await repository.create(createTestList());
      // Note: This test assumes tasks will be added via the task repository
      
      const lists = await repository.findAll();

      expect(lists.length).toBeGreaterThan(0);
      expect(lists[0]!.tasks).toBeDefined();
      expect(Array.isArray(lists[0]!.tasks)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an existing list', async () => {
      const originalList = await repository.create(createTestList({
        name: 'Original Name',
        description: 'Original Description',
      }));

      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const updatedList = await repository.update(originalList.id, updateData);

      expect(updatedList).toBeDefined();
      expect(updatedList!.id).toBe(originalList.id);
      expect(updatedList!.name).toBe(updateData.name);
      expect(updatedList!.description).toBe(updateData.description);
      expect(updatedList!.updatedAt.getTime()).toBeGreaterThan(originalList.updatedAt.getTime());
    });

    it('should partially update a list', async () => {
      const originalList = await repository.create(createTestList({
        name: 'Original Name',
        description: 'Original Description',
      }));

      const updatedList = await repository.update(originalList.id, {
        name: 'New Name Only',
      });

      expect(updatedList!.name).toBe('New Name Only');
      expect(updatedList!.description).toBe('Original Description');
    });

    it('should return null when updating non-existent list', async () => {
      const nonExistentId = generateTestId();
      
      const result = await repository.update(nonExistentId, { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing list', async () => {
      const list = await repository.create(createTestList());

      const deleteResult = await repository.delete(list.id);

      expect(deleteResult).toBe(true);

      const foundList = await repository.findById(list.id);
      expect(foundList).toBeNull();
    });

    it('should return false when deleting non-existent list', async () => {
      const nonExistentId = generateTestId();
      
      const deleteResult = await repository.delete(nonExistentId);

      expect(deleteResult).toBe(false);
    });

    it('should not affect other lists when deleting one', async () => {
      const list1 = await repository.create(createTestList({ name: 'List 1' }));
      const list2 = await repository.create(createTestList({ name: 'List 2' }));

      await repository.delete(list1.id);

      const remainingLists = await repository.findAll();
      expect(remainingLists).toHaveLength(1);
      expect(remainingLists[0]!.id).toBe(list2.id);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string names', async () => {
      const listData = createTestList({ name: '' });
      
      const createdList = await repository.create(listData);
      
      expect(createdList.name).toBe('');
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      const listData = createTestList({ description: longDescription });
      
      const createdList = await repository.create(listData);
      
      expect(createdList.description).toBe(longDescription);
    });
  });
});
