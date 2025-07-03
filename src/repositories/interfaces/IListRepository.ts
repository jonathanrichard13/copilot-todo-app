import { List, CreateListDto, UpdateListDto } from "../../models/List";

/**
 * Interface for List repository operations
 */
export interface IListRepository {
  /**
   * Create a new list
   */
  create(data: CreateListDto): Promise<List>;

  /**
   * Get all lists
   */
  findAll(): Promise<List[]>;

  /**
   * Get all lists with their associated tasks
   */
  findAllWithTasks(): Promise<List[]>;

  /**
   * Get a list by ID
   */
  findById(id: string): Promise<List | null>;

  /**
   * Get a list by ID with its associated tasks
   */
  findByIdWithTasks(id: string): Promise<List | null>;

  /**
   * Update a list
   */
  update(id: string, data: UpdateListDto): Promise<List | null>;

  /**
   * Delete a list
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a list exists
   */
  exists(id: string): Promise<boolean>;
}
