import * as fs from "fs";
import * as path from "path";
import { DatabaseConnection } from "../config/database";

/**
 * Migration interface
 */
export interface Migration {
  filename: string;
  sql: string;
}

/**
 * Migration manager class
 */
export class MigrationManager {
  private db: DatabaseConnection;
  private migrationsPath: string;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.migrationsPath = path.join(__dirname);
  }

  /**
   * Initialize migrations table
   */
  private async initializeMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.db.execute(sql);
  }

  /**
   * Get all migration files
   */
  private getMigrationFiles(): Migration[] {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(filename => ({
      filename,
      sql: fs.readFileSync(path.join(this.migrationsPath, filename), 'utf8')
    }));
  }

  /**
   * Get executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const rows = await this.db.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    return rows.map((row: any) => row.filename);
  }

  /**
   * Run migrations up
   */
  public async up(): Promise<void> {
    await this.db.connect();
    await this.initializeMigrationsTable();

    const migrations = this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.filename)) {
        console.log(`Running migration: ${migration.filename}`);
        
        // Execute migration SQL using executeMultiple for better SQL parsing
        try {
          await this.db.executeMultiple(migration.sql);
          console.log(`Executed migration: ${migration.filename}`);
        } catch (error) {
          console.error(`Error executing migration: ${migration.filename}`);
          throw error;
        }

        // Record migration
        await this.db.execute(
          'INSERT INTO migrations (filename) VALUES (?)',
          [migration.filename]
        );

        console.log(`Migration completed: ${migration.filename}`);
      }
    }

    console.log('All migrations completed');
  }

  /**
   * Run migrations down (rollback)
   */
  public async down(): Promise<void> {
    await this.db.connect();
    await this.initializeMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    console.log(`Rolling back migration: ${lastMigration}`);

    // For SQLite, we can't easily rollback schema changes
    // This is a simplified approach - in production, you'd want proper down scripts
    await this.db.execute(
      'DELETE FROM migrations WHERE filename = ?',
      [lastMigration]
    );

    console.log(`Rollback completed: ${lastMigration}`);
  }

  /**
   * Seed database with initial data
   */
  public async seed(): Promise<void> {
    await this.db.connect();
    
    console.log('Seeding database with initial data...');

    // Insert sample lists
    const sampleLists = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Personal Tasks',
        description: 'My personal todo items'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Work Projects',
        description: 'Work-related tasks and projects'
      }
    ];

    for (const list of sampleLists) {
      await this.db.execute(
        'INSERT OR IGNORE INTO lists (id, name, description) VALUES (?, ?, ?)',
        [list.id, list.name, list.description]
      );
    }

    // Insert sample tasks
    const sampleTasks = [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        title: 'Buy groceries',
        description: 'Milk, bread, eggs, and fruits',
        completed: false,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        list_id: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        title: 'Complete project proposal',
        description: 'Finish the Q4 project proposal document',
        completed: false,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        list_id: '550e8400-e29b-41d4-a716-446655440002'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        title: 'Call dentist',
        description: 'Schedule appointment for dental checkup',
        completed: true,
        deadline: null,
        priority: 'low',
        list_id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ];

    for (const task of sampleTasks) {
      await this.db.execute(
        'INSERT OR IGNORE INTO tasks (id, title, description, completed, deadline, priority, list_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.title, task.description, task.completed, task.deadline, task.priority, task.list_id]
      );
    }

    console.log('Database seeding completed');
  }
}

/**
 * CLI interface for migrations
 */
async function main(): Promise<void> {
  const manager = new MigrationManager();
  const command = process.argv[2] || 'up';

  try {
    switch (command) {
      case 'up':
        await manager.up();
        break;
      case 'down':
        await manager.down();
        break;
      case 'seed':
        await manager.seed();
        break;
      default:
        console.log('Usage: ts-node migrate.ts [up|down|seed]');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
