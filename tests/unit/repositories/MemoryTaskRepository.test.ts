import { MemoryTaskRepository } from '../../../src/repositories/memory/MemoryTaskRepository';
import { MemoryListRepository } from '../../../src/repositories/memory/MemoryListRepository';
import { TaskPriority } from '../../../src/models/Task';
import { testTasks, testLists, createTestList, createTestTask } from '../../fixtures/testData';

describe('MemoryTaskRepository', () => {
  let taskRepository: MemoryTaskRepository;
  let listRepository: MemoryListRepository;

  beforeEach(() => {
    taskRepository = new MemoryTaskRepository();
    listRepository = new MemoryListRepository();
  });

  describe('create', () => {
    it('should create a new task successfully', async () => {
      // Create a list first
      const list = await listRepository.create(createTestList());

      const taskData = createTestTask({
        title: 'Test task',
        description: 'Test description',
      });

      const createdTask = await taskRepository.create(list.id, taskData);

      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBe(taskData.description);
      expect(createdTask.listId).toBe(list.id);
      expect(createdTask.completed).toBe(false);
      expect(createdTask.priority).toBe(TaskPriority.MEDIUM);
      expect(createdTask.createdAt).toBeInstanceOf(Date);
      expect(createdTask.updatedAt).toBeInstanceOf(Date);
      expect(createdTask.deadline).toBeInstanceOf(Date);
    });

    it('should create multiple tasks with unique IDs', async () => {
      const list = await listRepository.create(createTestList());

      const task1 = await taskRepository.create(list.id, createTestTask({
        title: 'First task',
      }));

      const task2 = await taskRepository.create(list.id, createTestTask({
        title: 'Second task',
      }));

      expect(task1.id).not.toBe(task2.id);
      expect(task1.title).toBe('First task');
      expect(task2.title).toBe('Second task');
    });

    it('should handle tasks with minimal data', async () => {
      const list = await listRepository.create(createTestList());

      const taskData = {
        title: 'Minimal task',
      };

      const createdTask = await taskRepository.create(list.id, taskData);

      expect(createdTask.title).toBe(taskData.title);
      expect(createdTask.description).toBeNull();
      expect(createdTask.completed).toBe(false);
      expect(createdTask.priority).toBe(TaskPriority.MEDIUM);
      expect(createdTask.deadline).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find an existing task by ID', async () => {
      const list = await listRepository.create(createTestList());
      const createdTask = await taskRepository.create(list.id, createTestTask());

      const foundTask = await taskRepository.findById(createdTask.id);

      expect(foundTask).not.toBeNull();
      expect(foundTask!.id).toBe(createdTask.id);
      expect(foundTask!.title).toBe(createdTask.title);
    });

    it('should return null for non-existent task ID', async () => {
      const foundTask = await taskRepository.findById('non-existent-id');
      expect(foundTask).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await taskRepository.findAll();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      const list = await listRepository.create(createTestList());

      await taskRepository.create(list.id, createTestTask({
        title: 'First task',
      }));

      await taskRepository.create(list.id, createTestTask({
        title: 'Second task',
      }));

      const tasks = await taskRepository.findAll();

      expect(tasks.length).toBe(2);
      expect(tasks[0]!.title).toBe('First task');
      expect(tasks[1]!.title).toBe('Second task');
    });
  });

  describe('findByListId', () => {
    it('should return tasks for a specific list', async () => {
      const list1 = await listRepository.create(createTestList({ name: 'List 1' }));
      const list2 = await listRepository.create(createTestList({ name: 'List 2' }));

      await taskRepository.create(list1.id, createTestTask({
        title: 'Task for list 1',
      }));

      await taskRepository.create(list2.id, createTestTask({
        title: 'Task for list 2',
      }));

      const list1Tasks = await taskRepository.findByListId(list1.id);
      const list2Tasks = await taskRepository.findByListId(list2.id);

      expect(list1Tasks.length).toBe(1);
      expect(list2Tasks.length).toBe(1);
      expect(list1Tasks[0]!.title).toBe('Task for list 1');
      expect(list2Tasks[0]!.title).toBe('Task for list 2');
    });

    it('should return empty array for list with no tasks', async () => {
      const list = await listRepository.create(createTestList());
      const tasks = await taskRepository.findByListId(list.id);
      expect(tasks).toEqual([]);
    });

    it('should return empty array for non-existent list', async () => {
      const tasks = await taskRepository.findByListId('non-existent-list-id');
      expect(tasks).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const list = await listRepository.create(createTestList());
      const createdTask = await taskRepository.create(list.id, createTestTask());

      const updateData = {
        title: 'Updated task title',
        description: 'Updated description',
        completed: true,
        priority: TaskPriority.HIGH,
      };

      const updatedTask = await taskRepository.update(createdTask.id, updateData);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.title).toBe(updateData.title);
      expect(updatedTask!.description).toBe(updateData.description);
      expect(updatedTask!.completed).toBe(updateData.completed);
      expect(updatedTask!.priority).toBe(updateData.priority);
      expect(updatedTask!.updatedAt.getTime()).toBeGreaterThan(createdTask.updatedAt.getTime());
    });

    it('should partially update a task', async () => {
      const list = await listRepository.create(createTestList());
      const createdTask = await taskRepository.create(list.id, createTestTask());

      const updateData = {
        title: 'Updated title only',
      };

      const updatedTask = await taskRepository.update(createdTask.id, updateData);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.title).toBe(updateData.title);
      expect(updatedTask!.description).toBe(createdTask.description);
      expect(updatedTask!.completed).toBe(createdTask.completed);
    });

    it('should return null when updating non-existent task', async () => {
      const updateData = { title: 'Updated title' };
      const updatedTask = await taskRepository.update('non-existent-id', updateData);
      expect(updatedTask).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      const list = await listRepository.create(createTestList());
      const createdTask = await taskRepository.create(list.id, createTestTask());

      const deleted = await taskRepository.delete(createdTask.id);
      expect(deleted).toBe(true);

      const foundTask = await taskRepository.findById(createdTask.id);
      expect(foundTask).toBeNull();
    });

    it('should return false when deleting non-existent task', async () => {
      const deleted = await taskRepository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should not affect other tasks when deleting one', async () => {
      const list = await listRepository.create(createTestList());

      const task1 = await taskRepository.create(list.id, createTestTask({
        title: 'First task',
      }));

      const task2 = await taskRepository.create(list.id, createTestTask({
        title: 'Second task',
      }));

      await taskRepository.delete(task1.id);

      const remainingTask = await taskRepository.findById(task2.id);
      expect(remainingTask).not.toBeNull();
      expect(remainingTask!.id).toBe(task2.id);
    });
  });

  describe('filtering and querying', () => {
    it('should filter tasks by completed status', async () => {
      const list = await listRepository.create(createTestList());

      const task1 = await taskRepository.create(list.id, createTestTask({
        title: 'Pending task',
      }));

      const task2 = await taskRepository.create(list.id, createTestTask({
        title: 'Completed task',
      }));

      // Mark one task as completed
      await taskRepository.update(task2.id, { completed: true });

      const pendingTasks = await taskRepository.findAll({ completed: false });
      const completedTasks = await taskRepository.findAll({ completed: true });

      expect(pendingTasks.length).toBe(1);
      expect(completedTasks.length).toBe(1);
      expect(pendingTasks[0]!.completed).toBe(false);
      expect(completedTasks[0]!.completed).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const list = await listRepository.create(createTestList());

      await taskRepository.create(list.id, createTestTask({
        title: 'High priority task',
        priority: TaskPriority.HIGH,
      }));

      await taskRepository.create(list.id, createTestTask({
        title: 'Low priority task',
        priority: TaskPriority.LOW,
      }));

      const highPriorityTasks = await taskRepository.findAll({ priority: TaskPriority.HIGH });
      const lowPriorityTasks = await taskRepository.findAll({ priority: TaskPriority.LOW });

      expect(highPriorityTasks.length).toBe(1);
      expect(lowPriorityTasks.length).toBe(1);
      expect(highPriorityTasks[0]!.priority).toBe(TaskPriority.HIGH);
      expect(lowPriorityTasks[0]!.priority).toBe(TaskPriority.LOW);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string titles', async () => {
      const list = await listRepository.create(createTestList());

      const taskData = {
        title: '',
      };

      const createdTask = await taskRepository.create(list.id, taskData);
      expect(createdTask.title).toBe('');
    });

    it('should handle very long descriptions', async () => {
      const list = await listRepository.create(createTestList());

      const longDescription = 'a'.repeat(1000);
      const taskData = {
        title: 'Task with long description',
        description: longDescription,
      };

      const createdTask = await taskRepository.create(list.id, taskData);
      expect(createdTask.description).toBe(longDescription);
    });

    it('should handle future deadlines', async () => {
      const list = await listRepository.create(createTestList());

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const taskData = {
        title: 'Future task',
        deadline: futureDate,
      };

      const createdTask = await taskRepository.create(list.id, taskData);
      expect(createdTask.deadline).toEqual(futureDate);
    });
  });
});
