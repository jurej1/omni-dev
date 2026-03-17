import { OpenRouter, tool, stepCountIs } from "@openrouter/sdk";
import type { Model } from "@openrouter/sdk/esm/models/model";
import { tools } from "../tools";
import type { ReasoningEffort } from "../context/model";
import { Message } from "../context/messages";
import { logger } from "../logger";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import {
  OpenResponsesFunctionCallOutput,
  OpenResponsesFunctionToolCall,
  OpenResponsesReasoning,
  OpenResponsesUsage,
} from "@openrouter/sdk/esm/models";

import { FileScanner } from "../utils/file-scanner";
import { SystemPrompt } from "../utils/system";
import { Agent } from "../utils/agent";

type Tool = ReturnType<typeof tool>;

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const RAW_OUTPUTS_DIR = join(process.cwd(), "raw-outputs");

async function saveRawOutput(item: object): Promise<void> {
  await mkdir(RAW_OUTPUTS_DIR, { recursive: true });
  const timestamp = Date.now();
  const filename = `${timestamp}.json`;
  await writeFile(
    join(RAW_OUTPUTS_DIR, filename),
    JSON.stringify(item, null, 2),
  );
  logger.debug(`saved raw output: ${filename}`);
}

export namespace OpenRouterClient {
  function isChatModel(model: Model): boolean {
    const { inputModalities, outputModalities } = model.architecture;
    return (
      inputModalities.includes("text") &&
      outputModalities.includes("text") &&
      !outputModalities.includes("embeddings")
    );
  }

  export async function generateTitle(userMessage: string): Promise<string> {
    const result = openrouter.callModel({
      model: "openrouter/free",
      instructions: Agent.TITLE.instructions,
      input: userMessage,
    });

    const text = await result.getText();

    return text;
  }

  export async function compact(messages: Message[]): Promise<string> {
    const result = openrouter.callModel({
      model: "openrouter/free",
      instructions: Agent.COMPACTION.instructions,
      input: mapMessages(messages),
    });

    return result.getText();
  }

  export async function listModels(): Promise<Model[]> {
    const response = await openrouter.models.list();
    return response.data.filter(isChatModel);
  }

  export async function callModel({
    model,
    data,
    callback,
    onUsageData,
    tools: overrideTools,
    agentInstructions,
    reasoningEnabled,
    reasoningEffort,
  }: {
    model: string;
    data: Message[];
    callback: (msg: Message) => void;
    onUsageData: (data: OpenResponsesUsage) => void;
    tools?: Tool[];
    agentInstructions?: string;
    reasoningEnabled?: boolean;
    reasoningEffort?: ReasoningEffort;
  }) {
    logger.log(`callModel: model=${model}  inputLen=${data.length}`);

    const toolsList = overrideTools || tools;

    try {
      const result = openrouter.callModel({
        model,
        instructions: agentInstructions,
        parallelToolCalls: true,
        ...(reasoningEnabled
          ? {
              reasoning: {
                enabled: true,
                effort: reasoningEffort ?? "medium",
                summary: "concise",
              },
            }
          : {}),
        input: [
          {
            role: "system",
            content: SystemPrompt.instructions(),
          },
          {
            role: "system",
            content: `${process.cwd()} is the current working directory. And this are the files inside of it ${FileScanner.cached()}`,
          },
          ...mapMessages(data),
        ],
        tools: toolsList,
        stopWhen: stepCountIs(100000000000000),
      });

      for await (const item of result.getItemsStream()) {
        switch (item.type) {
          case "message":
            callback({
              type: item.type,
              id: item.id,
              role: item.role,
              status: item.status,
              content: item.content,
            });
            break;
          case "function_call":
            callback({
              type: item.type,
              id: item.id,
              callId: item.callId,
              name: item.name,
              arguments: item.arguments,
              status: item.status,
            });

            break;
          case "reasoning":
            callback({
              type: item.type,
              id: item.id,
              summary: item.summary,
              status: item.status,
              content: item.content,
            });
            break;
          case "function_call_output": {
            callback({
              type: item.type,
              id: item.id,
              callId: item.callId,
              output: item.output,
            });
            break;
          }
        }
      }

      const response = await result.getResponse();
      if (response.usage) {
        onUsageData(response.usage);
      }
    } catch (error) {
      logger.error("callModel error:", error);
      throw error;
    }
  }

  function mapMessages(messages: Message[]) {
    return messages
      .map((msg) => {
        switch (msg.type) {
          case "message": {
            if (msg.role === "user") {
              return { role: msg.role, content: msg.content };
            } else {
              return {
                role: msg.role,
                content: msg.content
                  .filter((m) => m.type === "output_text")
                  .map((m) => m.text)
                  .join(""),
              };
            }
          }
          case "function_call": {
            return {
              type: "function_call",
              callId: msg.callId,
              name: msg.name,
              id: msg.id,
              arguments: msg.arguments,
            } as OpenResponsesFunctionToolCall;
          }
          case "function_call_output": {
            return {
              type: "function_call_output",
              callId: msg.callId,
              output: msg.output,
            } as OpenResponsesFunctionCallOutput;
          }
          case "reasoning":
            return {
              id: msg.id,
              summary: msg.summary,
              type: msg.type,
              content: msg.content,
            } as OpenResponsesReasoning;
          default:
            return null;
        }
      })
      .filter((msg) => msg !== null);
  }
}
