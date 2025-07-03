# Todo List API - Implementation Architecture

## Project Structure

```
todo-api/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── ListController.ts
│   │   │   └── TaskController.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── logging.ts
│   │   ├── routes/
│   │   │   ├── listRoutes.ts
│   │   │   ├── taskRoutes.ts
│   │   │   └── index.ts
│   │   └── swagger/
│   │       ├── schemas/
│   │       └── swagger.config.ts
│   ├── services/
│   │   ├── ListService.ts
│   │   ├── TaskService.ts
│   │   └── interfaces/
│   │       ├── IListService.ts
│   │       └── ITaskService.ts
│   ├── repositories/
│   │   ├── interfaces/
│   │   │   ├── IListRepository.ts
│   │   │   └── ITaskRepository.ts
│   │   ├── memory/
│   │   │   ├── MemoryListRepository.ts
│   │   │   └── MemoryTaskRepository.ts
│   │   ├── sql/
│   │   │   ├── SQLListRepository.ts
│   │   │   ├── SQLTaskRepository.ts
│   │   │   └── database.ts
│   │   └── RepositoryFactory.ts
│   ├── models/
│   │   ├── List.ts
│   │   ├── Task.ts
│   │   └── ApiResponse.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   └── app.ts
│   ├── migrations/
│   │   ├── 001_create_lists_table.sql
│   │   ├── 002_create_tasks_table.sql
│   │   └── migrate.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── prd.md
│   ├── tasks.md
│   └── api-spec.yaml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

## Technology Stack Configuration

### Package.json Configuration

```json
{
  "name": "todo-list-api",
  "version": "1.0.0",
  "description": "RESTful API for Todo List application",
  "main": "dist/app.js",
  "scripts": {
    "dev": "vite-node --watch src/app.ts",
    "build": "vite build",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "migrate:up": "tsx src/migrations/migrate.ts up",
    "migrate:down": "tsx src/migrations/migrate.ts down",
    "migrate:reset": "tsx src/migrations/migrate.ts reset"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "joi": "^17.9.2",
    "uuid": "^9.0.0",
    "winston": "^3.10.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "pg": "^8.11.3",
    "mysql2": "^3.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/uuid": "^9.0.2",
    "@types/swagger-jsdoc": "^6.0.1",
    "@types/swagger-ui-express": "^4.1.3",
    "@types/pg": "^8.10.2",
    "@types/jest": "^29.5.3",
    "@types/supertest": "^2.0.12",
    "typescript": "^5.1.6",
    "vite": "^4.4.7",
    "vite-node": "^0.33.0",
    "vite-tsconfig-paths": "^4.2.0",
    "jest": "^29.6.1",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.2.0",
    "@typescript-eslint/parser": "^6.2.0",
    "prettier": "^3.0.0",
    "tsx": "^3.12.7"
  }
}
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: "src/app.ts",
      name: "TodoAPI",
      fileName: "app",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "express",
        "cors",
        "helmet",
        "dotenv",
        "joi",
        "uuid",
        "winston",
        "swagger-jsdoc",
        "swagger-ui-express",
        "pg",
        "mysql2",
      ],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/api/*": ["./api/*"],
      "@/services/*": ["./services/*"],
      "@/repositories/*": ["./repositories/*"],
      "@/models/*": ["./models/*"],
      "@/utils/*": ["./utils/*"],
      "@/config/*": ["./config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Data Models

### List Model (src/models/List.ts)

```typescript
/**
 * Represents a todo list entity
 */
export interface List {
  /** Unique identifier for the list */
  id: string;
  /** Name of the list */
  name: string;
  /** Optional description of the list */
  description?: string;
  /** Timestamp when the list was created */
  createdAt: Date;
  /** Timestamp when the list was last updated */
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
```

### Task Model (src/models/Task.ts)

```typescript
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
  description?: string;
  /** Optional deadline for the task */
  deadline?: Date;
  /** Whether the task is completed */
  completed: boolean;
  /** Priority level of the task */
  priority?: TaskPriority;
  /** ID of the list this task belongs to */
  listId: string;
  /** Timestamp when the task was created */
  createdAt: Date;
  /** Timestamp when the task was last updated */
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
  /** Updated deadline for the task */
  deadline?: Date;
  /** Updated completion status */
  completed?: boolean;
  /** Updated priority level */
  priority?: TaskPriority;
}

/**
 * Query parameters for filtering and sorting tasks
 */
export interface TaskQueryParams {
  /** Sort field (deadline, createdAt, etc.) */
  sort?: string;
  /** Sort order (asc, desc) */
  order?: "asc" | "desc";
  /** Filter by list ID */
  listId?: string;
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by priority */
  priority?: TaskPriority;
}
```

### API Response Models (src/models/ApiResponse.ts)

```typescript
/**
 * Standard API response format for successful operations
 */
export interface ApiResponse<T = any> {
  /** Indicates if the operation was successful */
  success: true;
  /** The response data */
  data: T;
  /** Optional success message */
  message?: string;
}

/**
 * Standard API response format for error operations
 */
export interface ApiErrorResponse {
  /** Indicates if the operation was successful */
  success: false;
  /** Error details */
  error: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: any;
  };
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
  };
}
```

## Repository Layer

### Repository Interfaces (src/repositories/interfaces/)

#### IListRepository.ts

```typescript
import { List, CreateListDto, UpdateListDto } from "@/models/List";

/**
 * Interface for List repository operations
 */
export interface IListRepository {
  /**
   * Retrieve all lists with optional task population
   * @param includeTasks - Whether to include tasks in the response
   * @returns Promise containing array of lists
   */
  findAll(includeTasks?: boolean): Promise<List[]>;

  /**
   * Find a list by its ID
   * @param id - The list ID
   * @param includeTasks - Whether to include tasks in the response
   * @returns Promise containing the list or null if not found
   */
  findById(id: string, includeTasks?: boolean): Promise<List | null>;

  /**
   * Create a new list
   * @param listData - Data for creating the list
   * @returns Promise containing the created list
   */
  create(listData: CreateListDto): Promise<List>;

  /**
   * Update an existing list
   * @param id - The list ID
   * @param listData - Updated list data
   * @returns Promise containing the updated list or null if not found
   */
  update(id: string, listData: UpdateListDto): Promise<List | null>;

  /**
   * Delete a list by its ID
   * @param id - The list ID
   * @returns Promise containing boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a list exists
   * @param id - The list ID
   * @returns Promise containing boolean indicating existence
   */
  exists(id: string): Promise<boolean>;
}
```

#### ITaskRepository.ts

```typescript
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
} from "@/models/Task";

/**
 * Interface for Task repository operations
 */
export interface ITaskRepository {
  /**
   * Find all tasks with optional filtering and sorting
   * @param params - Query parameters for filtering and sorting
   * @returns Promise containing array of tasks
   */
  findAll(params?: TaskQueryParams): Promise<Task[]>;

  /**
   * Find a task by its ID
   * @param id - The task ID
   * @returns Promise containing the task or null if not found
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Find all tasks belonging to a specific list
   * @param listId - The list ID
   * @param params - Query parameters for filtering and sorting
   * @returns Promise containing array of tasks
   */
  findByListId(listId: string, params?: TaskQueryParams): Promise<Task[]>;

  /**
   * Find tasks due within the current week
   * @param params - Optional query parameters
   * @returns Promise containing array of tasks
   */
  findDueThisWeek(params?: TaskQueryParams): Promise<Task[]>;

  /**
   * Create a new task
   * @param listId - The list ID to add the task to
   * @param taskData - Data for creating the task
   * @returns Promise containing the created task
   */
  create(listId: string, taskData: CreateTaskDto): Promise<Task>;

  /**
   * Update an existing task
   * @param id - The task ID
   * @param taskData - Updated task data
   * @returns Promise containing the updated task or null if not found
   */
  update(id: string, taskData: UpdateTaskDto): Promise<Task | null>;

  /**
   * Delete a task by its ID
   * @param id - The task ID
   * @returns Promise containing boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Delete all tasks belonging to a specific list
   * @param listId - The list ID
   * @returns Promise containing number of deleted tasks
   */
  deleteByListId(listId: string): Promise<number>;

  /**
   * Toggle the completion status of a task
   * @param id - The task ID
   * @returns Promise containing the updated task or null if not found
   */
  toggleComplete(id: string): Promise<Task | null>;
}
```

### Memory Repository Implementation (src/repositories/memory/)

#### MemoryListRepository.ts

```typescript
import { v4 as uuidv4 } from "uuid";
import { IListRepository } from "../interfaces/IListRepository";
import { List, CreateListDto, UpdateListDto } from "@/models/List";
import { Task } from "@/models/Task";

/**
 * In-memory implementation of List repository for development and testing
 */
export class MemoryListRepository implements IListRepository {
  private lists: Map<string, List> = new Map();
  private tasks: Map<string, Task> = new Map(); // Reference to tasks for population

  constructor(tasksRef?: Map<string, Task>) {
    if (tasksRef) {
      this.tasks = tasksRef;
    }
  }

  /**
   * Retrieve all lists with optional task population
   */
  async findAll(includeTasks: boolean = false): Promise<List[]> {
    const lists = Array.from(this.lists.values());

    if (includeTasks) {
      return lists.map((list) => ({
        ...list,
        tasks: Array.from(this.tasks.values()).filter(
          (task) => task.listId === list.id
        ),
      }));
    }

    return lists;
  }

  /**
   * Find a list by its ID
   */
  async findById(
    id: string,
    includeTasks: boolean = false
  ): Promise<List | null> {
    const list = this.lists.get(id);
    if (!list) return null;

    if (includeTasks) {
      return {
        ...list,
        tasks: Array.from(this.tasks.values()).filter(
          (task) => task.listId === id
        ),
      };
    }

    return list;
  }

  /**
   * Create a new list
   */
  async create(listData: CreateListDto): Promise<List> {
    const now = new Date();
    const list: List = {
      id: uuidv4(),
      name: listData.name,
      description: listData.description,
      createdAt: now,
      updatedAt: now,
    };

    this.lists.set(list.id, list);
    return list;
  }

  /**
   * Update an existing list
   */
  async update(id: string, listData: UpdateListDto): Promise<List | null> {
    const existingList = this.lists.get(id);
    if (!existingList) return null;

    const updatedList: List = {
      ...existingList,
      ...listData,
      updatedAt: new Date(),
    };

    this.lists.set(id, updatedList);
    return updatedList;
  }

  /**
   * Delete a list by its ID
   */
  async delete(id: string): Promise<boolean> {
    return this.lists.delete(id);
  }

  /**
   * Check if a list exists
   */
  async exists(id: string): Promise<boolean> {
    return this.lists.has(id);
  }

  /**
   * Get the internal lists map (for testing purposes)
   */
  getListsMap(): Map<string, List> {
    return this.lists;
  }

  /**
   * Clear all lists (for testing purposes)
   */
  clear(): void {
    this.lists.clear();
  }
}
```

## Database Migrations

### Migration SQL Scripts (src/migrations/)

#### 001_create_lists_table.sql

```sql
-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_lists_created_at ON lists(created_at);
CREATE INDEX idx_lists_name ON lists(name);
```

#### 002_create_tasks_table.sql

```sql
-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    list_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create composite index for common queries
CREATE INDEX idx_tasks_list_completed ON tasks(list_id, completed);
CREATE INDEX idx_tasks_deadline_completed ON tasks(deadline, completed);
```

### Migration Runner (src/migrations/migrate.ts)

```typescript
import * as fs from "fs";
import * as path from "path";
import { DatabaseConnection } from "@/config/database";

/**
 * Database migration runner
 */
export class MigrationRunner {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Run all pending migrations
   */
  async up(): Promise<void> {
    await this.createMigrationsTable();
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationFiles = this.getMigrationFiles();

    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        await this.runMigration(file);
        await this.recordMigration(file);
        console.log(`Completed migration: ${file}`);
      }
    }
  }

  /**
   * Rollback the last migration
   */
  async down(): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();
    if (appliedMigrations.length === 0) {
      console.log("No migrations to rollback");
      return;
    }

    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    const rollbackFile = lastMigration.replace(".sql", "_rollback.sql");

    if (fs.existsSync(path.join(__dirname, rollbackFile))) {
      console.log(`Rolling back migration: ${lastMigration}`);
      await this.runMigration(rollbackFile);
      await this.removeMigrationRecord(lastMigration);
      console.log(`Rolled back migration: ${lastMigration}`);
    } else {
      console.log(`No rollback file found for: ${lastMigration}`);
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.db.query(query);
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const query = "SELECT filename FROM migrations ORDER BY applied_at";
    const result = await this.db.query(query);
    return result.map((row: any) => row.filename);
  }

  private getMigrationFiles(): string[] {
    const migrationDir = __dirname;
    return fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql") && !file.includes("_rollback"))
      .sort();
  }

  private async runMigration(filename: string): Promise<void> {
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, "utf8");

    // Split by semicolon and execute each statement
    const statements = sql.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.db.query(statement);
      }
    }
  }

  private async recordMigration(filename: string): Promise<void> {
    const query = "INSERT INTO migrations (filename) VALUES (?)";
    await this.db.query(query, [filename]);
  }

  private async removeMigrationRecord(filename: string): Promise<void> {
    const query = "DELETE FROM migrations WHERE filename = ?";
    await this.db.query(query, [filename]);
  }
}

// CLI runner
if (require.main === module) {
  const command = process.argv[2];
  const db = new DatabaseConnection();
  const runner = new MigrationRunner(db);

  switch (command) {
    case "up":
      runner
        .up()
        .then(() => process.exit(0))
        .catch(console.error);
      break;
    case "down":
      runner
        .down()
        .then(() => process.exit(0))
        .catch(console.error);
      break;
    case "reset":
      runner
        .down()
        .then(() => runner.up())
        .then(() => process.exit(0))
        .catch(console.error);
      break;
    default:
      console.log("Usage: tsx migrate.ts [up|down|reset]");
      process.exit(1);
  }
}
```

## API Layer Examples

### List Controller (src/api/controllers/ListController.ts)

```typescript
import { Request, Response } from "express";
import { ListService } from "@/services/ListService";
import { ApiResponse, ApiErrorResponse } from "@/models/ApiResponse";
import { CreateListDto, UpdateListDto } from "@/models/List";

/**
 * Controller handling list-related HTTP requests
 */
export class ListController {
  constructor(private listService: ListService) {}

  /**
   * @swagger
   * /api/lists:
   *   get:
   *     summary: Retrieve all lists
   *     description: Get all todo lists with optional task population
   *     tags: [Lists]
   *     parameters:
   *       - in: query
   *         name: includeTasks
   *         schema:
   *           type: boolean
   *         description: Whether to include tasks in the response
   *     responses:
   *       200:
   *         description: Lists retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/List'
   *                 message:
   *                   type: string
   *                   example: "Lists retrieved successfully"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getAllLists(req: Request, res: Response): Promise<void> {
    try {
      const includeTasks = req.query.includeTasks === "true";
      const lists = await this.listService.getAllLists(includeTasks);

      const response: ApiResponse = {
        success: true,
        data: lists,
        message: "Lists retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error, "Failed to retrieve lists");
    }
  }

  /**
   * @swagger
   * /api/lists:
   *   post:
   *     summary: Create a new list
   *     description: Create a new todo list
   *     tags: [Lists]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateListDto'
   *     responses:
   *       201:
   *         description: List created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/List'
   *                 message:
   *                   type: string
   *                   example: "List created successfully"
   *       400:
   *         description: Invalid request data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   */
  async createList(req: Request, res: Response): Promise<void> {
    try {
      const listData: CreateListDto = req.body;
      const newList = await this.listService.createList(listData);

      const response: ApiResponse = {
        success: true,
        data: newList,
        message: "List created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error, "Failed to create list");
    }
  }

  /**
   * @swagger
   * /api/lists/{id}:
   *   put:
   *     summary: Update an existing list
   *     description: Update a todo list by its ID
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The list ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateListDto'
   *     responses:
   *       200:
   *         description: List updated successfully
   *       404:
   *         description: List not found
   *       400:
   *         description: Invalid request data
   *       500:
   *         description: Internal server error
   */
  async updateList(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const listData: UpdateListDto = req.body;
      const updatedList = await this.listService.updateList(id, listData);

      if (!updatedList) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "LIST_NOT_FOUND",
            message: `List with ID ${id} not found`,
          },
        };
        res.status(404).json(errorResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedList,
        message: "List updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error, "Failed to update list");
    }
  }

  /**
   * @swagger
   * /api/lists/{id}:
   *   delete:
   *     summary: Delete a list
   *     description: Delete a todo list by its ID
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The list ID
   *     responses:
   *       200:
   *         description: List deleted successfully
   *       404:
   *         description: List not found
   *       500:
   *         description: Internal server error
   */
  async deleteList(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.listService.deleteList(id);

      if (!deleted) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "LIST_NOT_FOUND",
            message: `List with ID ${id} not found`,
          },
        };
        res.status(404).json(errorResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { deleted: true },
        message: "List deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(res, error, "Failed to delete list");
    }
  }

  /**
   * Handle errors and send appropriate response
   */
  private handleError(res: Response, error: any, defaultMessage: string): void {
    console.error("ListController Error:", error);

    const statusCode = error.statusCode || 500;
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || defaultMessage,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };

    res.status(statusCode).json(errorResponse);
  }
}
```

## Swagger Configuration

### Swagger Setup (src/api/swagger/swagger.config.ts)

```typescript
import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo List API",
      version: "1.0.0",
      description: "RESTful API for managing todo lists and tasks",
      contact: {
        name: "API Support",
        email: "support@todoapi.com",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        List: {
          type: "object",
          required: ["id", "name", "createdAt", "updatedAt"],
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the list",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              description: "Name of the list",
              example: "Work Tasks",
            },
            description: {
              type: "string",
              description: "Optional description of the list",
              example: "Tasks related to work projects",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the list was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the list was last updated",
            },
            tasks: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Task",
              },
              description: "Array of tasks belonging to this list",
            },
          },
        },
        Task: {
          type: "object",
          required: [
            "id",
            "title",
            "completed",
            "listId",
            "createdAt",
            "updatedAt",
          ],
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the task",
              example: "123e4567-e89b-12d3-a456-426614174001",
            },
            title: {
              type: "string",
              description: "Title of the task",
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              description: "Optional description of the task",
              example: "Write comprehensive documentation for the new API",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "Optional deadline for the task",
            },
            completed: {
              type: "boolean",
              description: "Whether the task is completed",
              example: false,
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Priority level of the task",
              example: "high",
            },
            listId: {
              type: "string",
              description: "ID of the list this task belongs to",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the task was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the task was last updated",
            },
          },
        },
        CreateListDto: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "Name of the list",
              example: "Personal Tasks",
            },
            description: {
              type: "string",
              description: "Optional description of the list",
              example: "Tasks for personal activities",
            },
          },
        },
        UpdateListDto: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Updated name of the list",
              example: "Updated Personal Tasks",
            },
            description: {
              type: "string",
              description: "Updated description of the list",
              example: "Updated description for personal activities",
            },
          },
        },
        CreateTaskDto: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              description: "Title of the task",
              example: "Buy groceries",
            },
            description: {
              type: "string",
              description: "Optional description of the task",
              example: "Buy milk, bread, and eggs from the store",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "Optional deadline for the task",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Priority level of the task",
              example: "medium",
            },
          },
        },
        UpdateTaskDto: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Updated title of the task",
            },
            description: {
              type: "string",
              description: "Updated description of the task",
            },
            deadline: {
              type: "string",
              format: "date-time",
              description: "Updated deadline for the task",
            },
            completed: {
              type: "boolean",
              description: "Updated completion status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Updated priority level",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string",
                  example: "Invalid input data",
                },
                details: {
                  type: "object",
                  description: "Additional error details",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/api/controllers/*.ts", "./src/api/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Todo List API Documentation",
    })
  );

  // Serve the OpenAPI spec as JSON
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};
```

This implementation architecture provides:

1. **Complete folder structure** with separation of concerns
2. **TypeScript configuration** with proper paths and build setup
3. **Vite configuration** for fast development and building
4. **Detailed data models** with comprehensive interfaces
5. **Repository pattern** with both memory and SQL implementations
6. **Database migrations** with proper schema management
7. **API layer examples** with full TSDoc documentation
8. **Swagger/OpenAPI integration** for interactive documentation
9. **Comprehensive task breakdown** with checklists for tracking progress

The architecture follows the three-layer pattern you specified:

- **API Layer**: Controllers with Express.js and TSDoc
- **Service Layer**: Business logic and validation
- **Repository Layer**: Data access with memory and SQL options

All code includes proper TypeScript typing, error handling, and follows best practices for maintainable backend development.
