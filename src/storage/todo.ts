import { Database } from "bun:sqlite";
import { drizzle, BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { eq, asc } from "drizzle-orm";
import { TodoStorageSchema, TodoStatus, TodoPriority } from "./schema";

export type { TodoStatus, TodoPriority };

export interface TodoInput {
  content: string;
  status: TodoStatus;
  priority: TodoPriority;
  position: number;
}

export type TodoRow = typeof TodoStorageSchema.$inferSelect;

function createInMemoryDb(): BunSQLiteDatabase {
  const sqlite = new Database(":memory:");
  return drizzle(sqlite);
}

function initSchema(db: BunSQLiteDatabase): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
}

export namespace TodoUtil {
  let db: BunSQLiteDatabase = (() => {
    const instance = createInMemoryDb();
    initSchema(instance);
    return instance;
  })();

  export function resetForTest(): void {
    const instance = createInMemoryDb();
    initSchema(instance);
    db = instance;
  }

  export async function write(
    sessionId: string,
    todos: TodoInput[],
  ): Promise<void> {
    db.delete(TodoStorageSchema)
      .where(eq(TodoStorageSchema.session_id, sessionId))
      .run();

    if (todos.length === 0) return;

    const now = Date.now();
    db.insert(TodoStorageSchema)
      .values(
        todos.map((todo) => ({
          session_id: sessionId,
          content: todo.content,
          status: todo.status,
          priority: todo.priority,
          position: todo.position,
          created_at: now,
        })),
      )
      .run();
  }

  export async function get(sessionId: string): Promise<TodoRow[]> {
    return db
      .select()
      .from(TodoStorageSchema)
      .where(eq(TodoStorageSchema.session_id, sessionId))
      .orderBy(asc(TodoStorageSchema.position))
      .all();
  }
}
