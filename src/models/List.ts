import { Task } from "./Task";

/**
 * Represents a todo list entity
 */
export interface List {
  /** Unique identifier for the list */
  id: string;
  /** Name of the list */
  name: string;
  /** Optional description of the list */
  description?: string | null;
  /** Date when the list was created */
  createdAt: Date;
  /** Date when the list was last updated */
  updatedAt: Date;
  /** Array of tasks belonging to this list */
  tasks?: Task[];
}

/**
 * Data transfer object for creating a new list
 */
export interface CreateListDto {
  /** Name of the list */
  name: string;
  /** Optional description of the list */
  description?: string;
}

/**
 * Data transfer object for updating an existing list
 */
export interface UpdateListDto {
  /** Updated name of the list */
  name?: string;
  /** Updated description of the list */
  description?: string;
}
