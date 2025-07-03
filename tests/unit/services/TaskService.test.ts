import { TaskService } from '../../../src/services/TaskService';
import { MemoryTaskRepository } from '../../../src/repositories/memory/MemoryTaskRepository';
import { MemoryListRepository } from '../../../src/repositories/memory/MemoryListRepository';
import { TaskPriority } from '../../../src/models/Task';
import { ValidationError, NotFoundError } from '../../../src/utils/errors';
import { createTestList, createTestTask } from '../../fixtures/testData';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: MemoryTaskRepository;
  let listRepository: MemoryListRepository;
  let testListId: string;

  beforeEach(async () => {
    taskRepository = new MemoryTaskRepository();
    listRepository = new MemoryListRepository();
    taskService = new TaskService(taskRepository, listRepository);
    
    // Create a test list for tasks
    const testList = await listRepository.create(createTestList({ name: 'Test List' }));
    testListId = testList.id;
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const taskData = createTestTask({
        title: 'Test Task',
        description: 'Test description',
        priority: TaskPriority.HIGH,
      });

      const createdTask = await taskService.createTask(testListId, taskData);

      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.priority).toBe(taskData.priority);
      expect(createdTask.listId).toBe(testListId);
      expect(createdTask.completed).toBe(false);
      expect(createdTask.createdAt).toBeInstanceOf(Date);
      expect(createdTask.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a task with minimal data', async () => {
      const taskData = {
        title: 'Minimal Task',
      };

      const createdTask = await taskService.createTask(testListId, taskData);

      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBeNull();
      expect(createdTask.priority).toBe(TaskPriority.MEDIUM);
      expect(createdTask.deadline).toBeNull();
    });

    it('should throw ValidationError for empty list ID', async () => {
      const taskData = createTestTask();

      await expect(taskService.createTask('', taskData)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask('', taskData)).rejects.toThrow('List ID is required');
    });

    it('should throw NotFoundError for non-existent list', async () => {
      const taskData = createTestTask();

      await expect(taskService.createTask('non-existent-list-id', taskData)).rejects.toThrow(NotFoundError);
      await expect(taskService.createTask('non-existent-list-id', taskData)).rejects.toThrow('List not found');
    });

    it('should throw ValidationError for empty title', async () => {
      const taskData = createTestTask({
        title: '',
      });

      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow('Task title is required');
    });

    it('should throw ValidationError for whitespace-only title', async () => {
      const taskData = createTestTask({
        title: '   ',
      });

      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow('Task title is required');
    });

    it('should throw ValidationError for title that is too long', async () => {
      const taskData = createTestTask({
        title: 'a'.repeat(256),
      });

      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask(testListId, taskData)).rejects.toThrow('Task title cannot exceed 255 characters');
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await taskService.getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      await taskService.createTask(testListId, createTestTask({ title: 'Task 1' }));
      await taskService.createTask(testListId, createTestTask({ title: 'Task 2' }));

      const tasks = await taskService.getAllTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0]!.title).toBe('Task 1');
      expect(tasks[1]!.title).toBe('Task 2');
    });

    it('should filter tasks by completed status', async () => {
      const task1 = await taskService.createTask(testListId, createTestTask({ title: 'Pending Task' }));
      const task2 = await taskService.createTask(testListId, createTestTask({ title: 'Completed Task' }));

      // Mark one task as completed
      await taskService.updateTask(task2.id, { completed: true });

      const pendingTasks = await taskService.getAllTasks({ completed: false });
      const completedTasks = await taskService.getAllTasks({ completed: true });

      expect(pendingTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
      expect(pendingTasks[0]!.completed).toBe(false);
      expect(completedTasks[0]!.completed).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      await taskService.createTask(testListId, createTestTask({
        title: 'High Priority Task',
        priority: TaskPriority.HIGH,
      }));

      await taskService.createTask(testListId, createTestTask({
        title: 'Low Priority Task',
        priority: TaskPriority.LOW,
      }));

      const highPriorityTasks = await taskService.getAllTasks({ priority: TaskPriority.HIGH });
      const lowPriorityTasks = await taskService.getAllTasks({ priority: TaskPriority.LOW });

      expect(highPriorityTasks).toHaveLength(1);
      expect(lowPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0]!.priority).toBe(TaskPriority.HIGH);
      expect(lowPriorityTasks[0]!.priority).toBe(TaskPriority.LOW);
    });
  });

  describe('getTasksByListId', () => {
    it('should return tasks for a specific list', async () => {
      const list2 = await listRepository.create(createTestList({ name: 'List 2' }));

      await taskService.createTask(testListId, createTestTask({ title: 'Task for List 1' }));
      await taskService.createTask(list2.id, createTestTask({ title: 'Task for List 2' }));

      const list1Tasks = await taskService.getTasksByListId(testListId);
      const list2Tasks = await taskService.getTasksByListId(list2.id);

      expect(list1Tasks).toHaveLength(1);
      expect(list2Tasks).toHaveLength(1);
      expect(list1Tasks[0]!.title).toBe('Task for List 1');
      expect(list2Tasks[0]!.title).toBe('Task for List 2');
    });

    it('should return empty array for list with no tasks', async () => {
      const tasks = await taskService.getTasksByListId(testListId);
      expect(tasks).toEqual([]);
    });

    it('should throw ValidationError for empty list ID', async () => {
      await expect(taskService.getTasksByListId('')).rejects.toThrow(ValidationError);
      await expect(taskService.getTasksByListId('')).rejects.toThrow('List ID is required');
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({ title: 'Test Task' }));

      const foundTask = await taskService.getTaskById(createdTask.id);

      expect(foundTask).not.toBeNull();
      expect(foundTask!.id).toBe(createdTask.id);
      expect(foundTask!.title).toBe(createdTask.title);
    });

    it('should return null for non-existent task ID', async () => {
      const foundTask = await taskService.getTaskById('non-existent-id');
      expect(foundTask).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(taskService.getTaskById('')).rejects.toThrow(ValidationError);
      await expect(taskService.getTaskById('')).rejects.toThrow('Task ID is required');
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({ title: 'Original Title' }));

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        completed: true,
        priority: TaskPriority.HIGH,
      };

      const updatedTask = await taskService.updateTask(createdTask.id, updateData);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.id).toBe(createdTask.id);
      expect(updatedTask!.title).toBe(updateData.title);
      expect(updatedTask!.description).toBe(updateData.description);
      expect(updatedTask!.completed).toBe(updateData.completed);
      expect(updatedTask!.priority).toBe(updateData.priority);
      expect(updatedTask!.updatedAt.getTime()).toBeGreaterThan(createdTask.updatedAt.getTime());
    });

    it('should partially update a task', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({
        title: 'Original Title',
        description: 'Original description',
      }));

      const updateData = {
        title: 'Updated Title',
      };

      const updatedTask = await taskService.updateTask(createdTask.id, updateData);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.title).toBe(updateData.title);
      expect(updatedTask!.description).toBe(createdTask.description);
    });

    it('should return null for non-existent task ID', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedTask = await taskService.updateTask('non-existent-id', updateData);
      expect(updatedTask).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      const updateData = { title: 'Updated Title' };
      await expect(taskService.updateTask('', updateData)).rejects.toThrow(ValidationError);
      await expect(taskService.updateTask('', updateData)).rejects.toThrow('Task ID is required');
    });

    it('should throw ValidationError for empty title', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask());
      const updateData = { title: '' };

      await expect(taskService.updateTask(createdTask.id, updateData)).rejects.toThrow(ValidationError);
      await expect(taskService.updateTask(createdTask.id, updateData)).rejects.toThrow('Task title cannot be empty');
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({ title: 'Test Task' }));

      const deleted = await taskService.deleteTask(createdTask.id);

      expect(deleted).toBe(true);

      const foundTask = await taskService.getTaskById(createdTask.id);
      expect(foundTask).toBeNull();
    });

    it('should return false for non-existent task ID', async () => {
      const deleted = await taskService.deleteTask('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(taskService.deleteTask('')).rejects.toThrow(ValidationError);
      await expect(taskService.deleteTask('')).rejects.toThrow('Task ID is required');
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task completion from false to true', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({ title: 'Test Task' }));

      const toggledTask = await taskService.toggleTaskCompletion(createdTask.id);

      expect(toggledTask).not.toBeNull();
      expect(toggledTask!.completed).toBe(true);
      expect(toggledTask!.updatedAt.getTime()).toBeGreaterThan(createdTask.updatedAt.getTime());
    });

    it('should toggle task completion from true to false', async () => {
      const createdTask = await taskService.createTask(testListId, createTestTask({ title: 'Test Task' }));
      
      // First toggle to complete
      await taskService.toggleTaskCompletion(createdTask.id);
      
      // Then toggle back to incomplete
      const toggledTask = await taskService.toggleTaskCompletion(createdTask.id);

      expect(toggledTask).not.toBeNull();
      expect(toggledTask!.completed).toBe(false);
    });

    it('should return null for non-existent task ID', async () => {
      const toggledTask = await taskService.toggleTaskCompletion('non-existent-id');
      expect(toggledTask).toBeNull();
    });

    it('should throw ValidationError for empty ID', async () => {
      await expect(taskService.toggleTaskCompletion('')).rejects.toThrow(ValidationError);
      await expect(taskService.toggleTaskCompletion('')).rejects.toThrow('Task ID is required');
    });
  });
});
