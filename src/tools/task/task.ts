import { tool, OpenRouter } from "@openrouter/sdk";
import z from "zod";
import DESCRIPTION_TEMPLATE from "./task.txt";
import { Agent, type AgentTool } from "../../utils/agent";
import { SystemPrompt } from "../../utils/system";
import { FileScanner } from "../../utils/file-scanner";

function getAgents(): Record<string, AgentTool.Definition> {
  return { plan: Agent.PLAN, build: Agent.BUILD, explore: Agent.EXPLORE };
}

const DESCRIPTION = DESCRIPTION_TEMPLATE.replace(
  "{agents}",
  '- "plan": Analyzes the request and produces a step-by-step implementation plan before any code is written.\n- "build": Implements the plan by writing and modifying code in the codebase.\n- "explore": Searches and explores the codebase to find files, patterns, and relevant code.',
);

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const TaskInputSchema = z.object({
  description: z
    .string()
    .describe("A short (3-5 word) description of the task"),
  prompt: z.string().describe("The task for the agent to perform"),
  subagent_type: z
    .string()
    .describe(
      'The type of agent to use (e.g. "plan", "build", "explore" -> it has to be one of these three values)',
    ),
  task_id: z
    .string()
    .optional()
    .describe("Deprecated — kept for schema compatibility, not used"),
});

export type TaskInput = z.infer<typeof TaskInputSchema>;

export const taskTool = tool({
  name: "Task",
  inputSchema: TaskInputSchema,
  description: DESCRIPTION,
  execute: async (params) => {
    const { prompt, subagent_type } = params;

    const agent = getAgents()[subagent_type];
    if (!agent) {
      throw new Error(
        `Unknown subagent_type "${subagent_type}". Available: ${Object.keys(getAgents()).join(", ")}`,
      );
    }

    const result = openrouter.callModel({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      instructions: agent.instructions,
      input: [
        { role: "system", content: SystemPrompt.instructions() },
        {
          role: "system",
          content: `${process.cwd()} is the current working directory. And this are the files inside of it ${FileScanner.cached()}`,
        },
        { role: "user", content: prompt },
      ],
      tools: agent.toolsList,
    });

    const text = await result.getText();
    return JSON.stringify({ result: text });
  },
});
