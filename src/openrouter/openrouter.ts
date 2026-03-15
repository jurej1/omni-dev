import { OpenRouter, tool } from "@openrouter/sdk";
import { tools } from "../tools";
import { MessageStatus } from "../messages";
import { Message } from "../context/messages";
import { logger } from "../logger";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { OpenResponsesUsage } from "@openrouter/sdk/esm/models";
import { SystemPrompt } from "../utils/system";
import { FileScanner } from "../utils/file-scanner";

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
  export async function callModel({
    data,
    callback,
    onUsageData,
    tools: overrideTools,
    agentInstructions,
  }: {
    data: Message[];
    callback: (msg: Message) => void;
    onUsageData: (data: OpenResponsesUsage) => void;
    tools?: Tool[];
    agentInstructions?: string;
  }) {
    const model = "x-ai/grok-4.1-fast";
    logger.log(`callModel: model=${model}  inputLen=${data.length}`);

    const toolsList = overrideTools || tools;

    try {
      const result = openrouter.callModel({
        model,
        instructions: agentInstructions,
        parallelToolCalls: true,
        input: [
          {
            role: "system",
            content: SystemPrompt.instructions(),
          },
          {
            role: "system",
            content: `${process.cwd()} is the current working directory. And this are the files inside of it ${FileScanner.cached()}`,
          },
          ...data
            .filter((msg) => msg.type === "message")
            .map((msg) => {
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
            }),
        ],
        tools: toolsList,
      });

      for await (const item of result.getItemsStream()) {
        if (item.status === "completed") {
          await saveRawOutput(item);
        }
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
              status: item.status as MessageStatus | undefined,
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
}
