/**
 * Priority levels for tasks
 */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/**
 * Represents a task entity
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  /** Title of the task */
  title: string;
  /** Optional description of the task */
  description?: string | null;
  /** Whether the task is completed */
  completed: boolean;
  /** Optional deadline for the task */
  deadline?: Date | null;
  /** Priority level of the task */
  priority: TaskPriority;
  /** ID of the list this task belongs to */
  listId: string;
  /** Date when the task was created */
  createdAt: Date;
  /** Date when the task was last updated */
  updatedAt: Date;
}

/**
 * Data transfer object for creating a new task
 */
export interface CreateTaskDto {
  /** Title of the task */
  title: string;
  /** Optional description of the task */
  description?: string;
  /** Optional deadline for the task */
  deadline?: Date;
  /** Priority level of the task */
  priority?: TaskPriority;
}

/**
 * Data transfer object for updating an existing task
 */
export interface UpdateTaskDto {
  /** Updated title of the task */
  title?: string;
  /** Updated description of the task */
  description?: string;
  /** Updated completion status */
  completed?: boolean;
  /** Updated deadline */
  deadline?: Date;
  /** Updated priority level */
  priority?: TaskPriority;
}

/**
 * Query parameters for filtering and sorting tasks
 */
export interface TaskQueryParams {
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by priority level */
  priority?: TaskPriority;
  /** Sort field (deadline, createdAt, etc.) */
  sortBy?: 'deadline' | 'createdAt' | 'priority' | 'title';
  /** Sort order (asc/desc) */
  sortOrder?: 'asc' | 'desc';
  /** Filter by list ID */
  listId?: string;
}
