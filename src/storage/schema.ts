import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TODO_STATUSES = ["pending", "in_progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_PRIORITIES = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const TodoStorageSchema = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  session_id: text("session_id").notNull(),
  content: text("content").notNull(),
  status: text("status").$type<TodoStatus>().notNull(),
  priority: text("priority").$type<TodoPriority>().notNull(),
  position: integer("position").notNull(),
  created_at: integer("created_at").notNull(),
});
