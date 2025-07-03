import { Request, Response, NextFunction } from "express";
import { ListService } from "../../services/ListService";
import { TaskService } from "../../services/TaskService";
import { RepositoryFactory } from "../../repositories/RepositoryFactory";
import { ApiResponse } from "../../models/ApiResponse";
import { List, CreateListDto, UpdateListDto } from "../../models/List";
import { NotFoundError, ValidationError } from "../../utils/errors";

/**
 * Controller for List operations
 */
export class ListController {
  private listService: ListService;
  private taskService: TaskService;

  constructor() {
    const listRepo = RepositoryFactory.getListRepository();
    const taskRepo = RepositoryFactory.getTaskRepository();
    this.listService = new ListService(listRepo, taskRepo);
    this.taskService = new TaskService(taskRepo, listRepo);
  }

  /**
   * @swagger
   * /api/lists:
   *   get:
   *     summary: Get all lists
   *     tags: [Lists]
   *     parameters:
   *       - in: query
   *         name: withTasks
   *         schema:
   *           type: boolean
   *         description: Include tasks in the response
   *     responses:
   *       200:
   *         description: Successfully retrieved lists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/List'
   */
  public getAllLists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const withTasks = req.query.withTasks === 'true';
      
      const lists = withTasks 
        ? await this.listService.getAllListsWithTasks()
        : await this.listService.getAllLists();

      const response: ApiResponse<List[]> = {
        success: true,
        data: lists,
        message: 'Lists retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/lists/{id}:
   *   get:
   *     summary: Get a list by ID
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: List ID
   *       - in: query
   *         name: withTasks
   *         schema:
   *           type: boolean
   *         description: Include tasks in the response
   *     responses:
   *       200:
   *         description: Successfully retrieved list
   *       404:
   *         description: List not found
   */
  public getListById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('List ID is required');
      }
      
      const withTasks = req.query.withTasks === 'true';
      
      const list = withTasks 
        ? await this.listService.getListByIdWithTasks(id)
        : await this.listService.getListById(id);

      if (!list) {
        throw new NotFoundError('List not found');
      }

      const response: ApiResponse<List> = {
        success: true,
        data: list,
        message: 'List retrieved successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/lists:
   *   post:
   *     summary: Create a new list
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
   *       400:
   *         description: Validation error
   */
  public createList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createListDto: CreateListDto = req.body;
      
      const list = await this.listService.createList(createListDto);

      const response: ApiResponse<List> = {
        success: true,
        data: list,
        message: 'List created successfully',
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/lists/{id}:
   *   put:
   *     summary: Update a list
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: List ID
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
   */
  public updateList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('List ID is required');
      }
      
      const updateListDto: UpdateListDto = req.body;
      
      const list = await this.listService.updateList(id, updateListDto);

      if (!list) {
        throw new NotFoundError('List not found');
      }

      const response: ApiResponse<List> = {
        success: true,
        data: list,
        message: 'List updated successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/lists/{id}:
   *   delete:
   *     summary: Delete a list
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: List ID
   *     responses:
   *       200:
   *         description: List deleted successfully
   *       404:
   *         description: List not found
   */
  public deleteList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('List ID is required');
      }
      
      const deleted = await this.listService.deleteList(id);

      if (!deleted) {
        throw new NotFoundError('List not found');
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'List deleted successfully',
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
