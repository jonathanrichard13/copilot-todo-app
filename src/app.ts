import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/environment";
import { DatabaseConnection } from "./config/database";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { listRoutes } from "./api/routes/listRoutes";
import { taskRoutes } from "./api/routes/taskRoutes";

/**
 * Express application setup
 */
class App {
  public app: express.Application;
  private db: DatabaseConnection;

  constructor() {
    this.app = express();
    this.db = DatabaseConnection.getInstance();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }));
    
    // Logging middleware
    this.app.use(morgan('combined'));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Todo List API is running',
        timestamp: new Date(),
        environment: env.NODE_ENV,
      });
    });

    // API Documentation
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Todo List API Documentation',
    }));

    // OpenAPI specification endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // API routes
    this.app.use('/api/lists', listRoutes);
    this.app.use('/api/tasks', taskRoutes);
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.db.connect();
      
      // Start server
      this.app.listen(env.PORT, () => {
        console.log(`🚀 Todo List API server is running on port ${env.PORT}`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${env.PORT}/health`);
        console.log(`📖 API Documentation: http://localhost:${env.PORT}/docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down server...');
    await this.db.close();
    process.exit(0);
  }
}

// Create and export app instance
const app = new App();

// Handle graceful shutdown
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Start the server if this file is executed directly
if (require.main === module) {
  app.start();
}

export default app;
