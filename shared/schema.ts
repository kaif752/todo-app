import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
});

export const insertTodoSchema = createInsertSchema(todos)
  .pick({
    title: true,
    completed: true,
    dueDate: true,
  })
  .extend({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    dueDate: z.string().nullable(),
  });

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;