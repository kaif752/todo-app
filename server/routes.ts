import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/todos", async (_req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post("/api/todos", async (req, res) => {
    const result = insertTodoSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid todo data" });
      return;
    }
    const todo = await storage.createTodo(result.data);
    res.json(todo);
  });

  app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid todo id" });
      return;
    }

    try {
      const todo = await storage.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid todo id" });
      return;
    }

    try {
      await storage.deleteTodo(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  });

  return createServer(app);
}
