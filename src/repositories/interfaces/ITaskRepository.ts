import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
} from "../../models/Task";

/**
 * Interface for Task repository operations
 */
export interface ITaskRepository {
  /**
   * Create a new task
   */
  create(listId: string, data: CreateTaskDto): Promise<Task>;

  /**
   * Get all tasks
   */
  findAll(params?: TaskQueryParams): Promise<Task[]>;

  /**
   * Get tasks by list ID
   */
  findByListId(listId: string, params?: TaskQueryParams): Promise<Task[]>;

  /**
   * Get a task by ID
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Update a task
   */
  update(id: string, data: UpdateTaskDto): Promise<Task | null>;

  /**
   * Delete a task
   */
  delete(id: string): Promise<boolean>;

  /**
   * Toggle task completion status
   */
  toggleComplete(id: string): Promise<Task | null>;

  /**
   * Get tasks due within a specified date range
   */
  findDueInRange(startDate: Date, endDate: Date): Promise<Task[]>;

  /**
   * Get tasks due this week
   */
  findDueThisWeek(): Promise<Task[]>;

  /**
   * Get tasks sorted by deadline
   */
  findSortedByDeadline(order: 'asc' | 'desc'): Promise<Task[]>;

  /**
   * Check if a task exists
   */
  exists(id: string): Promise<boolean>;
}
