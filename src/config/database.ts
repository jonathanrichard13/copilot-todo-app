import { Database } from "sqlite3";
import * as path from "path";
import * as fs from "fs";
import { env } from "./environment";

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  filename: string;
  verbose?: boolean;
}

/**
 * SQLite database connection singleton
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database | null = null;

  private constructor() {}

  /**
   * Get database connection instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize database connection
   */
  public async connect(): Promise<Database> {
    if (this.db) {
      return this.db;
    }

    const dbPath = env.DATABASE_URL;
    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new Database(dbPath, (err) => {
        if (err) {
          console.error("Database connection error:", err);
          reject(err);
        } else {
          console.log("Connected to SQLite database:", dbPath);
          resolve(this.db as Database);
        }
      });
    });
  }

  /**
   * Get current database connection
   */
  public getConnection(): Database {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db?.close((err) => {
          if (err) {
            console.error("Error closing database:", err);
            reject(err);
          } else {
            console.log("Database connection closed");
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  /**
   * Execute SQL query with parameters
   */
  public async query(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.getConnection();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute SQL query and return first row
   */
  public async queryOne(sql: string, params: any[] = []): Promise<any> {
    const db = this.getConnection();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute SQL command (INSERT, UPDATE, DELETE)
   */
  public async execute(sql: string, params: any[] = []): Promise<{ lastID?: number; changes: number }> {
    const db = this.getConnection();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err: any) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Execute multiple SQL statements
   */
  public async executeMultiple(sql: string): Promise<void> {
    const db = this.getConnection();
    return new Promise((resolve, reject) => {
      db.exec(sql, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
