import { IListRepository } from "../repositories/interfaces/IListRepository";
import { ITaskRepository } from "../repositories/interfaces/ITaskRepository";
import { List, CreateListDto, UpdateListDto } from "../models/List";
import { ValidationError } from "../utils/errors";

/**
 * Service layer for List operations
 */
export class ListService {
  constructor(
    private listRepository: IListRepository,
    private taskRepository: ITaskRepository
  ) {}

  /**
   * Create a new list
   */
  async createList(data: CreateListDto): Promise<List> {
    this.validateCreateListData(data);
    return await this.listRepository.create(data);
  }

  /**
   * Get all lists
   */
  async getAllLists(): Promise<List[]> {
    return await this.listRepository.findAll();
  }

  /**
   * Get all lists with their tasks
   */
  async getAllListsWithTasks(): Promise<List[]> {
    return await this.listRepository.findAllWithTasks();
  }

  /**
   * Get a list by ID
   */
  async getListById(id: string): Promise<List | null> {
    if (!id) {
      throw new ValidationError('List ID is required');
    }
    return await this.listRepository.findById(id);
  }

  /**
   * Get a list by ID with its tasks
   */
  async getListByIdWithTasks(id: string): Promise<List | null> {
    if (!id) {
      throw new ValidationError('List ID is required');
    }
    return await this.listRepository.findByIdWithTasks(id);
  }

  /**
   * Update a list
   */
  async updateList(id: string, data: UpdateListDto): Promise<List | null> {
    if (!id) {
      throw new ValidationError('List ID is required');
    }
    
    this.validateUpdateListData(data);
    
    const existingList = await this.listRepository.findById(id);
    if (!existingList) {
      return null;
    }
    
    return await this.listRepository.update(id, data);
  }

  /**
   * Delete a list
   */
  async deleteList(id: string): Promise<boolean> {
    if (!id) {
      throw new ValidationError('List ID is required');
    }
    
    const existingList = await this.listRepository.findById(id);
    if (!existingList) {
      return false;
    }
    
    return await this.listRepository.delete(id);
  }

  /**
   * Check if a list exists
   */
  async listExists(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }
    return await this.listRepository.exists(id);
  }

  /**
   * Validate create list data
   */
  private validateCreateListData(data: CreateListDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('List name is required');
    }
    
    if (data.name.length > 255) {
      throw new ValidationError('List name cannot exceed 255 characters');
    }
    
    if (data.description && data.description.length > 1000) {
      throw new ValidationError('List description cannot exceed 1000 characters');
    }
  }

  /**
   * Validate update list data
   */
  private validateUpdateListData(data: UpdateListDto): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('List name cannot be empty');
      }
      
      if (data.name.length > 255) {
        throw new ValidationError('List name cannot exceed 255 characters');
      }
    }
    
    if (data.description !== undefined && data.description !== null && data.description.length > 1000) {
      throw new ValidationError('List description cannot exceed 1000 characters');
    }
  }
}
