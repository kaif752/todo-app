import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const PriorityLevel = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type Priority = typeof PriorityLevel[keyof typeof PriorityLevel];

// Predefined categories for better organization
export const DEFAULT_CATEGORIES = [
  "work",
  "personal",
  "shopping",
  "health",
  "home",
  "study",
] as const;

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default(PriorityLevel.MEDIUM),
  category: text("category"),
});

export const insertTodoSchema = createInsertSchema(todos)
  .pick({
    title: true,
    completed: true,
    dueDate: true,
    priority: true,
    category: true,
  })
  .extend({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    dueDate: z.string().nullable(),
    priority: z.enum([PriorityLevel.HIGH, PriorityLevel.MEDIUM, PriorityLevel.LOW]),
    category: z.string().nullable(),
  });

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;