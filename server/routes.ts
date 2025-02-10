import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  app.get("/api/todos", async (_req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post("/api/todos", async (req, res) => {
    const result = insertTodoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid todo data" });
    }

    const todo = await storage.createTodo(result.data);
    res.status(201).json(todo);
  });

  app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    const schema = z.object({ completed: z.boolean() });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    try {
      const todo = await storage.updateTodo(id, result.data.completed);
      res.json(todo);
    } catch (err) {
      res.status(404).json({ message: "Todo not found" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    try {
      await storage.deleteTodo(id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: "Todo not found" });
    }
  });

  return createServer(app);
}
