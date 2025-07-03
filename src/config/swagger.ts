import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'A comprehensive Todo List API built with TypeScript, Express.js, and SQLite',
      contact: {
        name: 'API Support',
        email: 'support@todoapi.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Lists',
        description: 'Todo list management operations',
      },
      {
        name: 'Tasks',
        description: 'Task management operations',
      },
    ],
    components: {
      schemas: {
        List: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the list',
              example: 'list-123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: 'Name of the todo list',
              example: 'Personal Tasks',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the list',
              example: 'Tasks for personal life management',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the list was created',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the list was last updated',
              example: '2024-01-01T00:00:00.000Z',
            },
            tasks: {
              type: 'array',
              description: 'Tasks associated with this list',
              items: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        Task: {
          type: 'object',
          required: ['title', 'listId'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the task',
              example: 'task-123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              description: 'Title of the task',
              example: 'Buy groceries',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the task',
              example: 'Buy milk, bread, and eggs from the store',
              nullable: true,
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
              example: false,
              default: false,
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task',
              example: '2024-01-15T23:59:59.000Z',
              nullable: true,
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Priority level of the task',
              example: 'medium',
              default: 'medium',
            },
            listId: {
              type: 'string',
              description: 'ID of the list this task belongs to',
              example: 'list-123e4567-e89b-12d3-a456-426614174000',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the task was created',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the task was last updated',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        CreateListRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the todo list',
              example: 'Personal Tasks',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the list',
              example: 'Tasks for personal life management',
            },
          },
        },
        UpdateListRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the todo list',
              example: 'Updated Personal Tasks',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the list',
              example: 'Updated tasks for personal life management',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the task',
              example: 'Buy groceries',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the task',
              example: 'Buy milk, bread, and eggs from the store',
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task',
              example: '2024-01-15T23:59:59.000Z',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Priority level of the task',
              example: 'medium',
              default: 'medium',
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the task',
              example: 'Buy groceries and household items',
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Optional description of the task',
              example: 'Buy milk, bread, eggs, and cleaning supplies from the store',
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task',
              example: '2024-01-15T23:59:59.000Z',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Priority level of the task',
              example: 'high',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
              example: true,
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Human readable message about the result',
              example: 'Operation completed successfully',
            },
            data: {
              description: 'The response data',
              nullable: true,
            },
            error: {
              type: 'string',
              description: 'Error message if the request failed',
              nullable: true,
              example: null,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Human readable error message',
              example: 'Validation failed',
            },
            data: {
              description: 'Always null for error responses',
              nullable: true,
              example: null,
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
              example: 'Name is required and must be between 1 and 255 characters',
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Resource not found',
                data: null,
                error: 'The requested resource was not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Validation failed',
                data: null,
                error: 'Name is required and must be between 1 and 255 characters',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Internal server error',
                data: null,
                error: 'An unexpected error occurred',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
