import { ITaskRepository } from "../repositories/interfaces/ITaskRepository";
import { IListRepository } from "../repositories/interfaces/IListRepository";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskPriority,
} from "../models/Task";
import { ValidationError, NotFoundError } from "../utils/errors";

/**
 * Service layer for Task operations
 */
export class TaskService {
  constructor(
    private taskRepository: ITaskRepository,
    private listRepository: IListRepository
  ) {}

  /**
   * Create a new task
   */
  async createTask(listId: string, data: CreateTaskDto): Promise<Task> {
    if (!listId) {
      throw new ValidationError('List ID is required');
    }
    
    // Verify list exists
    const listExists = await this.listRepository.exists(listId);
    if (!listExists) {
      throw new NotFoundError('List not found');
    }
    
    this.validateCreateTaskData(data);
    return await this.taskRepository.create(listId, data);
  }

  /**
   * Get all tasks
   */
  async getAllTasks(params?: TaskQueryParams): Promise<Task[]> {
    return await this.taskRepository.findAll(params);
  }

  /**
   * Get tasks by list ID
   */
  async getTasksByListId(listId: string, params?: TaskQueryParams): Promise<Task[]> {
    if (!listId) {
      throw new ValidationError('List ID is required');
    }
    
    return await this.taskRepository.findByListId(listId, params);
  }

  /**
   * Get a task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }
    return await this.taskRepository.findById(id);
  }

  /**
   * Update a task
   */
  async updateTask(id: string, data: UpdateTaskDto): Promise<Task | null> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }
    
    this.validateUpdateTaskData(data);
    
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return null;
    }
    
    return await this.taskRepository.update(id, data);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<boolean> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }
    
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return false;
    }
    
    return await this.taskRepository.delete(id);
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    if (!id) {
      throw new ValidationError('Task ID is required');
    }
    
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return null;
    }
    
    return await this.taskRepository.toggleComplete(id);
  }

  /**
   * Get tasks due this week
   */
  async getTasksDueThisWeek(): Promise<Task[]> {
    return await this.taskRepository.findDueThisWeek();
  }

  /**
   * Get tasks sorted by deadline
   */
  async getTasksSortedByDeadline(order: 'asc' | 'desc' = 'asc'): Promise<Task[]> {
    return await this.taskRepository.findSortedByDeadline(order);
  }

  /**
   * Get tasks due within a date range
   */
  async getTasksDueInRange(startDate: Date, endDate: Date): Promise<Task[]> {
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }
    
    if (startDate > endDate) {
      throw new ValidationError('Start date cannot be after end date');
    }
    
    return await this.taskRepository.findDueInRange(startDate, endDate);
  }

  /**
   * Check if a task exists
   */
  async taskExists(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }
    return await this.taskRepository.exists(id);
  }

  /**
   * Validate create task data
   */
  private validateCreateTaskData(data: CreateTaskDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Task title is required');
    }
    
    if (data.title.length > 255) {
      throw new ValidationError('Task title cannot exceed 255 characters');
    }
    
    if (data.description && data.description.length > 1000) {
      throw new ValidationError('Task description cannot exceed 1000 characters');
    }
    
    if (data.priority && !Object.values(TaskPriority).includes(data.priority)) {
      throw new ValidationError('Invalid task priority');
    }
    
    if (data.deadline && data.deadline < new Date()) {
      throw new ValidationError('Task deadline cannot be in the past');
    }
  }

  /**
   * Validate update task data
   */
  private validateUpdateTaskData(data: UpdateTaskDto): void {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new ValidationError('Task title cannot be empty');
      }
      
      if (data.title.length > 255) {
        throw new ValidationError('Task title cannot exceed 255 characters');
      }
    }
    
    if (data.description !== undefined && data.description !== null && data.description.length > 1000) {
      throw new ValidationError('Task description cannot exceed 1000 characters');
    }
    
    if (data.priority !== undefined && !Object.values(TaskPriority).includes(data.priority)) {
      throw new ValidationError('Invalid task priority');
    }
    
    if (data.deadline !== undefined && data.deadline !== null && data.deadline < new Date()) {
      throw new ValidationError('Task deadline cannot be in the past');
    }
  }
}
