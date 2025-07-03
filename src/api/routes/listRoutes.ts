import { Router } from "express";
import { ListController } from "../controllers/ListController";
import { TaskController } from "../controllers/TaskController";

const router = Router();
const listController = new ListController();
const taskController = new TaskController();

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Get all todo lists
 *     tags: [Lists]
 *     description: Retrieve all todo lists with their associated tasks
 *     responses:
 *       200:
 *         description: Successfully retrieved all lists
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", listController.getAllLists);

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     summary: Get a specific todo list
 *     tags: [Lists]
 *     description: Retrieve a todo list by its ID with associated tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The list ID
 *         example: list-123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Successfully retrieved the list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/List'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:id", listController.getListById);

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new todo list
 *     tags: [Lists]
 *     description: Create a new todo list with a name and optional description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListRequest'
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/List'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", listController.createList);

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     summary: Update a todo list
 *     tags: [Lists]
 *     description: Update a todo list's name and/or description
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The list ID
 *         example: list-123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListRequest'
 *     responses:
 *       200:
 *         description: List updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/List'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/:id", listController.updateList);

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     summary: Delete a todo list
 *     tags: [Lists]
 *     description: Delete a todo list and all its associated tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The list ID
 *         example: list-123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: List deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:id", listController.deleteList);

/**
 * @swagger
 * /api/lists/{listId}/tasks:
 *   post:
 *     summary: Create a new task in a list
 *     tags: [Tasks]
 *     description: Create a new task within a specific todo list
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: The list ID where the task will be created
 *         example: list-123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/:listId/tasks", taskController.createTask);

export { router as listRoutes };
