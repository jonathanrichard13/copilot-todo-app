import { v4 as uuidv4 } from "uuid";
import { DatabaseConnection } from "../../config/database";
import { IListRepository } from "../interfaces/IListRepository";
import { List, CreateListDto, UpdateListDto } from "../../models/List";
import { Task } from "../../models/Task";

/**
 * SQL-based implementation of List repository using SQLite
 */
export class SQLListRepository implements IListRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Create a new list
   */
  async create(data: CreateListDto): Promise<List> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.db.execute(
      'INSERT INTO lists (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, data.name, data.description || null, now, now]
    );

    const list = await this.findById(id);
    if (!list) {
      throw new Error('Failed to create list');
    }
    return list;
  }

  /**
   * Get all lists
   */
  async findAll(): Promise<List[]> {
    const rows = await this.db.query('SELECT * FROM lists ORDER BY created_at DESC');
    return rows.map(this.mapRowToList);
  }

  /**
   * Get all lists with their associated tasks
   */
  async findAllWithTasks(): Promise<List[]> {
    const sql = `
      SELECT 
        l.id as list_id, l.name as list_name, l.description as list_description,
        l.created_at as list_created_at, l.updated_at as list_updated_at,
        t.id as task_id, t.title as task_title, t.description as task_description,
        t.completed as task_completed, t.deadline as task_deadline, t.priority as task_priority,
        t.created_at as task_created_at, t.updated_at as task_updated_at
      FROM lists l
      LEFT JOIN tasks t ON l.id = t.list_id
      ORDER BY l.created_at DESC, t.created_at ASC
    `;
    
    const rows = await this.db.query(sql);
    return this.groupTasksByList(rows);
  }

  /**
   * Get a list by ID
   */
  async findById(id: string): Promise<List | null> {
    const row = await this.db.queryOne('SELECT * FROM lists WHERE id = ?', [id]);
    return row ? this.mapRowToList(row) : null;
  }

  /**
   * Get a list by ID with its associated tasks
   */
  async findByIdWithTasks(id: string): Promise<List | null> {
    const sql = `
      SELECT 
        l.id as list_id, l.name as list_name, l.description as list_description,
        l.created_at as list_created_at, l.updated_at as list_updated_at,
        t.id as task_id, t.title as task_title, t.description as task_description,
        t.completed as task_completed, t.deadline as task_deadline, t.priority as task_priority,
        t.created_at as task_created_at, t.updated_at as task_updated_at
      FROM lists l
      LEFT JOIN tasks t ON l.id = t.list_id
      WHERE l.id = ?
      ORDER BY t.created_at ASC
    `;
    
    const rows = await this.db.query(sql, [id]);
    if (rows.length === 0) return null;
    
    const grouped = this.groupTasksByList(rows);
    return grouped[0] || null;
  }

  /**
   * Update a list
   */
  async update(id: string, data: UpdateListDto): Promise<List | null> {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    
    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const sql = `UPDATE lists SET ${updates.join(', ')} WHERE id = ?`;
    const result = await this.db.execute(sql, params);
    
    return result.changes > 0 ? await this.findById(id) : null;
  }

  /**
   * Delete a list
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM lists WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Check if a list exists
   */
  async exists(id: string): Promise<boolean> {
    const row = await this.db.queryOne('SELECT 1 FROM lists WHERE id = ?', [id]);
    return !!row;
  }

  /**
   * Map database row to List object
   */
  private mapRowToList(row: any): List {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database row to Task object
   */
  private mapRowToTask(row: any): Task {
    const task: Task = {
      id: row.task_id,
      title: row.task_title,
      description: row.task_description,
      completed: Boolean(row.task_completed),
      priority: row.task_priority,
      listId: row.list_id,
      createdAt: new Date(row.task_created_at),
      updatedAt: new Date(row.task_updated_at),
    };
    
    if (row.task_deadline) {
      task.deadline = new Date(row.task_deadline);
    }
    
    return task;
  }

  /**
   * Group tasks by list from joined query results
   */
  private groupTasksByList(rows: any[]): List[] {
    const listMap = new Map<string, List>();
    
    for (const row of rows) {
      const listId = row.list_id;
      
      if (!listMap.has(listId)) {
        listMap.set(listId, {
          id: listId,
          name: row.list_name,
          description: row.list_description,
          createdAt: new Date(row.list_created_at),
          updatedAt: new Date(row.list_updated_at),
          tasks: [],
        });
      }
      
      const list = listMap.get(listId)!;
      if (row.task_id) {
        list.tasks!.push(this.mapRowToTask(row));
      }
    }
    
    return Array.from(listMap.values());
  }
}
