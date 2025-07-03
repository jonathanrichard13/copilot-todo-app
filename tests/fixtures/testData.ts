import { List, CreateListDto } from '../../src/models/List';
import { Task, TaskPriority, CreateTaskDto } from '../../src/models/Task';

/**
 * Test data fixtures
 */
export const testLists: Partial<List>[] = [
  {
    name: 'Work Tasks',
    description: 'Tasks related to work projects',
  },
  {
    name: 'Personal Tasks',
    description: 'Personal life management tasks',
  },
  {
    name: 'Shopping List',
    description: 'Items to buy from the store',
  },
];

export const testTasks: Partial<Task>[] = [
  {
    title: 'Complete project proposal',
    description: 'Finish the quarterly project proposal document',
    priority: TaskPriority.HIGH,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    completed: false,
  },
  {
    title: 'Review team performance',
    description: 'Conduct performance reviews for team members',
    priority: TaskPriority.MEDIUM,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    completed: false,
  },
  {
    title: 'Buy groceries',
    description: 'Get milk, bread, and eggs from the store',
    priority: TaskPriority.LOW,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    completed: false,
  },
  {
    title: 'Exercise',
    description: 'Go for a 30-minute run in the park',
    priority: TaskPriority.MEDIUM,
    deadline: null,
    completed: true,
  },
  {
    title: 'Call dentist',
    description: 'Schedule annual dental checkup',
    priority: TaskPriority.LOW,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    completed: false,
  },
];

/**
 * Create test list with valid data
 */
export const createTestList = (overrides: Partial<CreateListDto> = {}): CreateListDto => {
  return {
    name: 'Test List',
    description: 'A test list for unit testing',
    ...overrides,
  };
};

/**
 * Create test task with valid data
 */
export const createTestTask = (overrides: Partial<CreateTaskDto> = {}): CreateTaskDto => {
  return {
    title: 'Test Task',
    description: 'A test task for unit testing',
    priority: TaskPriority.MEDIUM,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...overrides,
  };
};
