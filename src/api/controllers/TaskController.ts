import { Request, Response, NextFunction } from "express";
import { TaskService } from "../../services/TaskService";
import { ListService } from "../../services/ListService";
import { RepositoryFactory } from "../../repositories/RepositoryFactory";
import { ApiResponse } from "../../models/ApiResponse";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskPriority,
} from "../../models/Task";
import { NotFoundError, ValidationError } from "../../utils/errors";

/**
 * Controller for Task operations
 */
export class TaskController {
  private taskService: TaskService;
  private listService: ListService;

  constructor() {
    const listRepo = RepositoryFactory.getListRepository();
    const taskRepo = RepositoryFactory.getTaskRepository();
    this.taskService = new TaskService(taskRepo, listRepo);
    this.listService = new ListService(listRepo, taskRepo);
  }

  /**
   * @swagger
   * /api/tasks:
   *   get:
   *     summary: Get all tasks
   *     tags: [Tasks]
   *     parameters:
   *       - in: query
   *         name: completed
   *         schema:
   *           type: boolean
   *         description: Filter by completion status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high]
   *         description: Filter by priority level
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [deadline, createdAt, priority, title]
   *         description: Sort field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *     responses:
   *       200:
   *         description: Successfully retrieved tasks
   */
  public getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = this.parseQueryParams(req.query);
      const tasks = await this.taskService.getAllTasks(params);

      const response: ApiResponse<Task[]> = {
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/{id}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Successfully retrieved task
   *       404:
   *         description: Task not found
   */
  public getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('Task ID is required');
      }
      
      const task = await this.taskService.getTaskById(id);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        message: 'Task retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/lists/{listId}/tasks:
   *   post:
   *     summary: Create a new task in a list
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *         description: List ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTaskDto'
   *     responses:
   *       201:
   *         description: Task created successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: List not found
   */
  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { listId } = req.params;
      
      if (!listId) {
        throw new ValidationError('List ID is required');
      }
      
      const createTaskDto: CreateTaskDto = req.body;
      
      const task = await this.taskService.createTask(listId, createTaskDto);

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        message: 'Task created successfully',
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/{id}:
   *   put:
   *     summary: Update a task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTaskDto'
   *     responses:
   *       200:
   *         description: Task updated successfully
   *       404:
   *         description: Task not found
   */
  public updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('Task ID is required');
      }
      
      const updateTaskDto: UpdateTaskDto = req.body;
      
      const task = await this.taskService.updateTask(id, updateTaskDto);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        message: 'Task updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *       404:
   *         description: Task not found
   */
  public deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('Task ID is required');
      }
      
      const deleted = await this.taskService.deleteTask(id);

      if (!deleted) {
        throw new NotFoundError('Task not found');
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Task deleted successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/{id}/complete:
   *   patch:
   *     summary: Toggle task completion status
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task completion status toggled successfully
   *       404:
   *         description: Task not found
   */
  public toggleTaskCompletion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('Task ID is required');
      }
      
      const task = await this.taskService.toggleTaskCompletion(id);

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
        message: 'Task completion status updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/due-this-week:
   *   get:
   *     summary: Get tasks due this week
   *     tags: [Tasks]
   *     responses:
   *       200:
   *         description: Successfully retrieved tasks due this week
   */
  public getTasksDueThisWeek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getTasksDueThisWeek();

      const response: ApiResponse<Task[]> = {
        success: true,
        data: tasks,
        message: 'Tasks due this week retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/tasks/sorted-by-deadline:
   *   get:
   *     summary: Get tasks sorted by deadline
   *     tags: [Tasks]
   *     parameters:
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order, defaults to ascending
   *     responses:
   *       200:
   *         description: Successfully retrieved tasks sorted by deadline
   */
  public getTasksSortedByDeadline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = req.query.order as 'asc' | 'desc' || 'asc';
      const tasks = await this.taskService.getTasksSortedByDeadline(order);

      const response: ApiResponse<Task[]> = {
        success: true,
        data: tasks,
        message: 'Tasks sorted by deadline retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Parse query parameters for task filtering and sorting
   */
  private parseQueryParams(query: any): TaskQueryParams {
    const params: TaskQueryParams = {};

    if (query.completed !== undefined) {
      params.completed = query.completed === 'true';
    }

    if (query.priority && Object.values(TaskPriority).includes(query.priority)) {
      params.priority = query.priority as TaskPriority;
    }

    if (query.sortBy && ['deadline', 'createdAt', 'priority', 'title'].includes(query.sortBy)) {
      params.sortBy = query.sortBy as 'deadline' | 'createdAt' | 'priority' | 'title';
    }

    if (query.sortOrder && ['asc', 'desc'].includes(query.sortOrder)) {
      params.sortOrder = query.sortOrder as 'asc' | 'desc';
    }

    if (query.listId) {
      params.listId = query.listId;
    }

    return params;
  }
}
