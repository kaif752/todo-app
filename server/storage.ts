import { type Todo, type InsertTodo } from "@shared/schema";

export interface IStorage {
  getTodos(): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private todos: Map<number, Todo>;
  private currentId: number;

  constructor() {
    this.todos = new Map();
    this.currentId = 1;
  }

  async getTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.currentId++;
    const todo: Todo = { ...insertTodo, id };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    const updatedTodo = { ...todo, ...updates };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    if (!this.todos.has(id)) {
      throw new Error(`Todo with id ${id} not found`);
    }
    this.todos.delete(id);
  }
}

export const storage = new MemStorage();
