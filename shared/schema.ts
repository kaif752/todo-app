import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const insertTodoSchema = createInsertSchema(todos)
  .pick({
    title: true,
  })
  .extend({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  });

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
