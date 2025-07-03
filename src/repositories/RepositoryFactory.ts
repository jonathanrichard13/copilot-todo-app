import { IListRepository } from "./interfaces/IListRepository";
import { ITaskRepository } from "./interfaces/ITaskRepository";
import { MemoryListRepository } from "./memory/MemoryListRepository";
import { MemoryTaskRepository } from "./memory/MemoryTaskRepository";
import { SQLListRepository } from "./sql/SQLListRepository";
import { SQLTaskRepository } from "./sql/SQLTaskRepository";
import { env } from "../config/environment";

/**
 * Repository implementation types
 */
export type RepositoryType = 'memory' | 'sql';

/**
 * Repository factory for creating repository instances
 */
export class RepositoryFactory {
  private static listRepository: IListRepository;
  private static taskRepository: ITaskRepository;

  /**
   * Get List repository instance
   */
  public static getListRepository(type?: RepositoryType): IListRepository {
    if (!this.listRepository) {
      const repositoryType = type || this.getDefaultRepositoryType();
      this.listRepository = this.createListRepository(repositoryType);
    }
    return this.listRepository;
  }

  /**
   * Get Task repository instance
   */
  public static getTaskRepository(type?: RepositoryType): ITaskRepository {
    if (!this.taskRepository) {
      const repositoryType = type || this.getDefaultRepositoryType();
      this.taskRepository = this.createTaskRepository(repositoryType);
    }
    return this.taskRepository;
  }

  /**
   * Create List repository instance
   */
  private static createListRepository(type: RepositoryType): IListRepository {
    switch (type) {
      case 'memory':
        return new MemoryListRepository();
      case 'sql':
        return new SQLListRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Create Task repository instance
   */
  private static createTaskRepository(type: RepositoryType): ITaskRepository {
    switch (type) {
      case 'memory':
        return new MemoryTaskRepository();
      case 'sql':
        return new SQLTaskRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Get default repository type based on environment
   */
  private static getDefaultRepositoryType(): RepositoryType {
    // Use SQL by default, memory for testing
    return env.NODE_ENV === 'test' ? 'memory' : 'sql';
  }

  /**
   * Reset repository instances (for testing)
   */
  public static reset(): void {
    this.listRepository = null as any;
    this.taskRepository = null as any;
  }
}
