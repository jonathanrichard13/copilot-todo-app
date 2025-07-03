import { ListService } from '../../../src/services/ListService';
import { MemoryListRepository } from '../../../src/repositories/memory/MemoryListRepository';
import { MemoryTaskRepository } from '../../../src/repositories/memory/MemoryTaskRepository';
import { ValidationError } from '../../../src/utils/errors';
import { createTestList, createTestTask } from '../../fixtures/testData';

describe('ListService', () => {
  let listService: ListService;
  let listRepository: MemoryListRepository;
  let taskRepository: MemoryTaskRepository;

  beforeEach(() => {
    listRepository = new MemoryListRepository();
    taskRepository = new MemoryTaskRepository();
    listService = new ListService(listRepository, taskRepository);
  });

  describe('createList', () => {
    it('should create a new list successfully', async () => {
      const listData = createTestList({
        name: 'Test List',
        description: 'A test list',
      });

      const createdList = await listService.createList(listData);

      expect(createdList.id).toBeDefined();
      expect(createdList.name).toBe(listData.name);
      expect(createdList.description).toBe(listData.description);
      expect(createdList.createdAt).toBeInstanceOf(Date);
      expect(createdList.updatedAt).toBeInstanceOf(Date);
      expect(createdList.tasks).toEqual([]);
    });

    it('should create a list without description', async () => {
      const listData = {
        name: 'Test List',
      };

      const createdList = await listService.createList(listData);

      expect(createdList.name).toBe(listData.name);
      expect(createdList.description).toBeNull();
    });

    it('should throw ValidationError for empty name', async () => {
      const listData = createTestList({
        name: '',
      });

      await expect(listService.createList(listData)).rejects.toThrow(ValidationError);
      await expect(listService.createList(listData)).rejects.toThrow('List name is required');
    });

    it('should throw ValidationError for whitespace-only name', async () => {
      const listData = createTestList({
        name: '   ',
      });

      await expect(listService.createList(listData)).rejects.toThrow(ValidationError);
      await expect(listService.createList(listData)).rejects.toThrow('List name is required');
    });

    it('should throw ValidationError for name that is too long', async () => {
      const listData = createTestList({
        name: 'a'.repeat(256),
      });

      await expect(listService.createList(listData)).rejects.toThrow(ValidationError);
      await expect(listService.createList(listData)).rejects.toThrow('List name cannot exceed 255 characters');
    });
  });

  describe('getAllLists', () => {
    it('should return empty array when no lists exist', async () => {
      const lists = await listService.getAllLists();
      expect(lists).toEqual([]);
    });

    it('should return all lists', async () => {
      await listService.createList(createTestList({ name: 'List 1' }));
      await listService.createList(createTestList({ name: 'List 2' }));

      const lists = await listService.getAllLists();

      expect(lists).toHaveLength(2);
      expect(lists[0]!.name).toBe('List 1');
      expect(lists[1]!.name).toBe('List 2');
    });
  });

  describe('getAllListsWithTasks', () => {
    it('should return lists with their tasks', async () => {
      const list = await listService.createList(createTestList({ name: 'Test List' }));
      
      // Add some tasks to the list
      const task1 = await taskRepository.create(list.id, createTestTask({ title: 'Task 1' }));
      const task2 = await taskRepository.create(list.id, createTestTask({ title: 'Task 2' }));
      
      // Add tasks to the list repository for the test
      listRepository.addTask(task1);
      listRepository.addTask(task2);

      const listsWithTasks = await listService.getAllListsWithTasks();

      expect(listsWithTasks).toHaveLength(1);
      expect(listsWithTasks[0]!.tasks).toHaveLength(2);
      expect(listsWithTasks[0]!.tasks![0]!.title).toBe('Task 1');
      expect(listsWithTasks[0]!.tasks![1]!.title).toBe('Task 2');
    });

    it('should return lists with empty tasks array when no tasks exist', async () => {
      await listService.createList(createTestList({ name: 'Empty List' }));

      const listsWithTasks = await listService.getAllListsWithTasks();

      expect(listsWithTasks).toHaveLength(1);
      expect(listsWithTasks[0]!.tasks).toEqual([]);
    });
  });

  describe('getListById', () => {
    it('should return a list by ID', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Test List' }));

      const foundList = await listService.getListById(createdList.id);

      expect(foundList).not.toBeNull();
      expect(foundList!.id).toBe(createdList.id);
      expect(foundList!.name).toBe(createdList.name);
    });

    it('should return null for non-existent list ID', async () => {
      const foundList = await listService.getListById('non-existent-id');
      expect(foundList).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(listService.getListById('')).rejects.toThrow(ValidationError);
      await expect(listService.getListById('')).rejects.toThrow('List ID is required');
    });
  });

  describe('getListByIdWithTasks', () => {
    it('should return a list with its tasks', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Test List' }));
      const task = await taskRepository.create(createdList.id, createTestTask({ title: 'Task 1' }));
      
      // Add task to the list repository for the test
      listRepository.addTask(task);

      const foundList = await listService.getListByIdWithTasks(createdList.id);

      expect(foundList).not.toBeNull();
      expect(foundList!.id).toBe(createdList.id);
      expect(foundList!.tasks).toHaveLength(1);
      expect(foundList!.tasks![0]!.title).toBe('Task 1');
    });

    it('should return null for non-existent list ID', async () => {
      const foundList = await listService.getListByIdWithTasks('non-existent-id');
      expect(foundList).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(listService.getListByIdWithTasks('')).rejects.toThrow(ValidationError);
      await expect(listService.getListByIdWithTasks('')).rejects.toThrow('List ID is required');
    });
  });

  describe('updateList', () => {
    it('should update an existing list', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Original Name' }));

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const updatedList = await listService.updateList(createdList.id, updateData);

      expect(updatedList).not.toBeNull();
      expect(updatedList!.id).toBe(createdList.id);
      expect(updatedList!.name).toBe(updateData.name);
      expect(updatedList!.description).toBe(updateData.description);
      expect(updatedList!.updatedAt.getTime()).toBeGreaterThan(createdList.updatedAt.getTime());
    });

    it('should partially update a list', async () => {
      const createdList = await listService.createList(createTestList({
        name: 'Original Name',
        description: 'Original description',
      }));

      const updateData = {
        name: 'Updated Name',
      };

      const updatedList = await listService.updateList(createdList.id, updateData);

      expect(updatedList).not.toBeNull();
      expect(updatedList!.name).toBe(updateData.name);
      expect(updatedList!.description).toBe(createdList.description);
    });

    it('should return null for non-existent list ID', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedList = await listService.updateList('non-existent-id', updateData);
      expect(updatedList).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      const updateData = { name: 'Updated Name' };
      await expect(listService.updateList('', updateData)).rejects.toThrow(ValidationError);
      await expect(listService.updateList('', updateData)).rejects.toThrow('List ID is required');
    });

    it('should throw ValidationError for empty name', async () => {
      const createdList = await listService.createList(createTestList());
      const updateData = { name: '' };

      await expect(listService.updateList(createdList.id, updateData)).rejects.toThrow(ValidationError);
      await expect(listService.updateList(createdList.id, updateData)).rejects.toThrow('List name cannot be empty');
    });

    it('should throw ValidationError for name that is too long', async () => {
      const createdList = await listService.createList(createTestList());
      const updateData = { name: 'a'.repeat(256) };

      await expect(listService.updateList(createdList.id, updateData)).rejects.toThrow(ValidationError);
      await expect(listService.updateList(createdList.id, updateData)).rejects.toThrow('List name cannot exceed 255 characters');
    });
  });

  describe('deleteList', () => {
    it('should delete an existing list', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Test List' }));

      const deleted = await listService.deleteList(createdList.id);

      expect(deleted).toBe(true);

      const foundList = await listService.getListById(createdList.id);
      expect(foundList).toBeNull();
    });

    it('should delete list and its associated tasks', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Test List' }));
      const task = await taskRepository.create(createdList.id, createTestTask({ title: 'Task 1' }));
      
      // Add task to the list repository so it will be deleted
      listRepository.addTask(task);

      const deleted = await listService.deleteList(createdList.id);

      expect(deleted).toBe(true);

      // The task should be deleted from the list repository's task collection
      const foundList = await listService.getListById(createdList.id);
      expect(foundList).toBeNull();
    });

    it('should return false for non-existent list ID', async () => {
      const deleted = await listService.deleteList('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(listService.deleteList('')).rejects.toThrow(ValidationError);
      await expect(listService.deleteList('')).rejects.toThrow('List ID is required');
    });
  });

  describe('listExists', () => {
    it('should return true for existing list', async () => {
      const createdList = await listService.createList(createTestList({ name: 'Test List' }));

      const exists = await listService.listExists(createdList.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent list', async () => {
      const exists = await listService.listExists('non-existent-id');

      expect(exists).toBe(false);
    });

    it('should return false for empty ID', async () => {
      const exists = await listService.listExists('');

      expect(exists).toBe(false);
    });
  });
});
