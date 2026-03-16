import { tool } from "@openrouter/sdk";
import z from "zod";
import { TodoUtil } from "../../storage/todo";
import { TODO_STATUSES, TODO_PRIORITIES } from "../../storage/schema";
import { SessionUtil } from "../../utils/session";

const TodoItemSchema = z.object({
  content: z.string().describe("Todo item description"),
  status: z.enum(TODO_STATUSES).describe("Current status"),
  priority: z.enum(TODO_PRIORITIES).describe("Priority level"),
  position: z.number().int().min(0).describe("Order position (0-indexed)"),
});

export const WriteTodosInputSchema = z.object({
  todos: z
    .array(TodoItemSchema)
    .describe("Full list of todos to store (replaces existing)"),
});

export const WriteTodosOutputSchema = z.object({
  success: z.boolean(),
  count: z.number().describe("Number of todos stored"),
});

export type WriteTodosInput = z.infer<typeof WriteTodosInputSchema>;

export const GetTodosInputSchema = z.object({});

export type GetTodosInput = z.infer<typeof GetTodosInputSchema>;

export const GetTodosOutputSchema = z.object({
  todos: z.array(
    z.object({
      id: z.number(),
      session_id: z.string(),
      content: z.string(),
      status: z.enum(TODO_STATUSES),
      priority: z.enum(TODO_PRIORITIES),
      position: z.number(),
      created_at: z.number(),
    }),
  ),
});

export const writeTodosTool = tool({
  name: "write_todos",
  description:
    "Persist the full todo list for this session. Replaces all existing todos.",
  inputSchema: WriteTodosInputSchema,
  outputSchema: WriteTodosOutputSchema,
  execute: async ({ todos }) => {
    await TodoUtil.write(SessionUtil.id, todos);
    return { success: true, count: todos.length };
  },
});

export const getTodosTool = tool({
  name: "get_todos",
  description: "Retrieve all todos for this session, ordered by position.",
  inputSchema: GetTodosInputSchema,
  outputSchema: GetTodosOutputSchema,
  execute: async () => {
    const rows = await TodoUtil.get(SessionUtil.id);
    return {
      todos: rows.map((row) => ({
        id: row.id,
        session_id: row.session_id,
        content: row.content,
        status: row.status,
        priority: row.priority,
        position: row.position,
        created_at: row.created_at,
      })),
    };
  },
});
