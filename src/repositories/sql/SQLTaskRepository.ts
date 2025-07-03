import { v4 as uuidv4 } from "uuid";
import { DatabaseConnection } from "../../config/database";
import { ITaskRepository } from "../interfaces/ITaskRepository";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskPriority,
} from "../../models/Task";

/**
 * SQL-based implementation of Task repository using SQLite
 */
export class SQLTaskRepository implements ITaskRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Create a new task
   */
  async create(listId: string, data: CreateTaskDto): Promise<Task> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.db.execute(
      'INSERT INTO tasks (id, title, description, completed, deadline, priority, list_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.title,
        data.description || null,
        false,
        data.deadline ? data.deadline.toISOString() : null,
        data.priority || TaskPriority.MEDIUM,
        listId,
        now,
        now
      ]
    );

    const task = await this.findById(id);
    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  }

  /**
   * Get all tasks
   */
  async findAll(params?: TaskQueryParams): Promise<Task[]> {
    const { sql, queryParams } = this.buildQuery('SELECT * FROM tasks', params);
    const rows = await this.db.query(sql, queryParams);
    return rows.map(this.mapRowToTask);
  }

  /**
   * Get tasks by list ID
   */
  async findByListId(listId: string, params?: TaskQueryParams): Promise<Task[]> {
    const baseQuery = 'SELECT * FROM tasks WHERE list_id = ?';
    const { sql, queryParams } = this.buildQuery(baseQuery, params, [listId]);
    const rows = await this.db.query(sql, queryParams);
    return rows.map(this.mapRowToTask);
  }

  /**
   * Get a task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const row = await this.db.queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    return row ? this.mapRowToTask(row) : null;
  }

  /**
   * Update a task
   */
  async update(id: string, data: UpdateTaskDto): Promise<Task | null> {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.completed !== undefined) {
      updates.push('completed = ?');
      params.push(data.completed);
    }
    if (data.deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(data.deadline ? data.deadline.toISOString() : null);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }
    
    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const result = await this.db.execute(sql, params);
    
    return result.changes > 0 ? await this.findById(id) : null;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<Task | null> {
    const now = new Date().toISOString();
    const result = await this.db.execute(
      'UPDATE tasks SET completed = NOT completed, updated_at = ? WHERE id = ?',
      [now, id]
    );
    
    return result.changes > 0 ? await this.findById(id) : null;
  }

  /**
   * Get tasks due within a specified date range
   */
  async findDueInRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      WHERE deadline IS NOT NULL 
      AND deadline >= ? 
      AND deadline <= ?
      ORDER BY deadline ASC
    `;
    const rows = await this.db.query(sql, [startDate.toISOString(), endDate.toISOString()]);
    return rows.map(this.mapRowToTask);
  }

  /**
   * Get tasks due this week
   */
  async findDueThisWeek(): Promise<Task[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.findDueInRange(startOfWeek, endOfWeek);
  }

  /**
   * Get tasks sorted by deadline
   */
  async findSortedByDeadline(order: 'asc' | 'desc' = 'asc'): Promise<Task[]> {
    const sql = `
      SELECT * FROM tasks 
      ORDER BY 
        CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
        deadline ${order.toUpperCase()}
    `;
    const rows = await this.db.query(sql);
    return rows.map(this.mapRowToTask);
  }

  /**
   * Check if a task exists
   */
  async exists(id: string): Promise<boolean> {
    const row = await this.db.queryOne('SELECT 1 FROM tasks WHERE id = ?', [id]);
    return !!row;
  }

  /**
   * Build SQL query with filters and sorting
   */
  private buildQuery(baseQuery: string, params?: TaskQueryParams, initialParams: any[] = []): { sql: string; queryParams: any[] } {
    let sql = baseQuery;
    const queryParams = [...initialParams];
    const conditions: string[] = [];

    if (params) {
      if (params.completed !== undefined) {
        conditions.push('completed = ?');
        queryParams.push(params.completed);
      }
      if (params.priority !== undefined) {
        conditions.push('priority = ?');
        queryParams.push(params.priority);
      }
      if (params.listId !== undefined) {
        conditions.push('list_id = ?');
        queryParams.push(params.listId);
      }
    }

    if (conditions.length > 0) {
      const whereClause = baseQuery.includes('WHERE') ? ' AND ' : ' WHERE ';
      sql += whereClause + conditions.join(' AND ');
    }

    if (params?.sortBy) {
      const sortBy = params.sortBy === 'deadline' ? 
        'CASE WHEN deadline IS NULL THEN 1 ELSE 0 END, deadline' : 
        params.sortBy;
      const sortOrder = params.sortOrder || 'asc';
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      sql += ' ORDER BY created_at ASC';
    }

    return { sql, queryParams };
  }

  /**
   * Map database row to Task object
   */
  private mapRowToTask(row: any): Task {
    const task: Task = {
      id: row.id,
      title: row.title,
      description: row.description,
      completed: Boolean(row.completed),
      priority: row.priority,
      listId: row.list_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
    
    if (row.deadline) {
      task.deadline = new Date(row.deadline);
    }
    
    return task;
  }
}
