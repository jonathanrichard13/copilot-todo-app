import { v4 as uuidv4 } from "uuid";
import { IListRepository } from "../interfaces/IListRepository";
import { List, CreateListDto, UpdateListDto } from "../../models/List";
import { Task } from "../../models/Task";

/**
 * In-memory implementation of List repository for development and testing
 */
export class MemoryListRepository implements IListRepository {
  private lists: Map<string, List> = new Map();
  private tasks: Map<string, Task> = new Map();

  /**
   * Create a new list
   */
  async create(data: CreateListDto): Promise<List> {
    const list: List = {
      id: uuidv4(),
      name: data.name,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [], // Initialize empty tasks array
    };

    this.lists.set(list.id, list);
    return list;
  }

  /**
   * Get all lists
   */
  async findAll(): Promise<List[]> {
    const lists = Array.from(this.lists.values());
    return lists.map(list => ({
      ...list,
      tasks: Array.from(this.tasks.values()).filter(task => task.listId === list.id)
    }));
  }

  /**
   * Get all lists with their associated tasks
   */
  async findAllWithTasks(): Promise<List[]> {
    const lists = Array.from(this.lists.values());
    return lists.map(list => ({
      ...list,
      tasks: Array.from(this.tasks.values()).filter(task => task.listId === list.id)
    }));
  }

  /**
   * Get a list by ID
   */
  async findById(id: string): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    return {
      ...list,
      tasks: Array.from(this.tasks.values()).filter(task => task.listId === id)
    };
  }

  /**
   * Get a list by ID with its associated tasks
   */
  async findByIdWithTasks(id: string): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    return {
      ...list,
      tasks: Array.from(this.tasks.values()).filter(task => task.listId === id)
    };
  }

  /**
   * Update a list
   */
  async update(id: string, data: UpdateListDto): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    // Add a small delay to ensure updatedAt is different
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedList: List = {
      ...list,
      ...data,
      updatedAt: new Date(),
      tasks: Array.from(this.tasks.values()).filter(task => task.listId === id)
    };

    this.lists.set(id, updatedList);
    return updatedList;
  }

  /**
   * Delete a list
   */
  async delete(id: string): Promise<boolean> {
    const deleted = this.lists.delete(id);
    
    // Delete associated tasks
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => task.listId === id);
    
    tasksToDelete.forEach(task => this.tasks.delete(task.id));
    
    return deleted;
  }

  /**
   * Check if a list exists
   */
  async exists(id: string): Promise<boolean> {
    return this.lists.has(id);
  }

  /**
   * Add a task to the internal tasks map (for testing purposes)
   */
  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  /**
   * Clear all data (for testing purposes)
   */
  clear(): void {
    this.lists.clear();
    this.tasks.clear();
  }
}
