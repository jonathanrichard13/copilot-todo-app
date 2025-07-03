import { v4 as uuidv4 } from "uuid";
import { ITaskRepository } from "../interfaces/ITaskRepository";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskPriority,
} from "../../models/Task";

/**
 * In-memory implementation of Task repository for development and testing
 */
export class MemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();

  /**
   * Create a new task
   */
  async create(listId: string, data: CreateTaskDto): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: data.title,
      description: data.description || null,
      completed: false,
      deadline: data.deadline || null,
      priority: data.priority || TaskPriority.MEDIUM,
      listId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Get all tasks
   */
  async findAll(params?: TaskQueryParams): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    return this.applyFiltersAndSorting(tasks, params);
  }

  /**
   * Get tasks by list ID
   */
  async findByListId(listId: string, params?: TaskQueryParams): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values()).filter(task => task.listId === listId);
    return this.applyFiltersAndSorting(tasks, params);
  }

  /**
   * Get a task by ID
   */
  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  /**
   * Update a task
   */
  async update(id: string, data: UpdateTaskDto): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    // Add a small delay to ensure updatedAt is different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedTask: Task = {
      ...task,
      ...data,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    // Add a small delay to ensure updatedAt is different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Get tasks due within a specified date range
   */
  async findDueInRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.deadline) return false;
      return task.deadline >= startDate && task.deadline <= endDate;
    });
  }

  /**
   * Get tasks due this week
   */
  async findDueThisWeek(): Promise<Task[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.findDueInRange(startOfWeek, endOfWeek);
  }

  /**
   * Get tasks sorted by deadline
   */
  async findSortedByDeadline(order: 'asc' | 'desc' = 'asc'): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    
    return tasks.sort((a, b) => {
      // Tasks without deadlines go to the end
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      
      const comparison = a.deadline.getTime() - b.deadline.getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Check if a task exists
   */
  async exists(id: string): Promise<boolean> {
    return this.tasks.has(id);
  }

  /**
   * Apply filters and sorting to tasks
   */
  private applyFiltersAndSorting(tasks: Task[], params?: TaskQueryParams): Task[] {
    if (!params) return tasks;

    // Apply filters
    let filteredTasks = tasks;

    if (params.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === params.completed);
    }

    if (params.priority !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
    }

    if (params.listId !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.listId === params.listId);
    }

    // Apply sorting
    if (params.sortBy) {
      filteredTasks.sort((a, b) => {
        let aValue: any = a[params.sortBy!];
        let bValue: any = b[params.sortBy!];

        // Handle Date objects
        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return params.sortOrder === 'desc' ? -comparison : comparison;
        }

        // Numeric comparison
        const comparison = aValue - bValue;
        return params.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filteredTasks;
  }

  /**
   * Clear all data (for testing purposes)
   */
  clear(): void {
    this.tasks.clear();
  }
}
