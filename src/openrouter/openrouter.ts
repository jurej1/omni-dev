import { OpenRouter } from "@openrouter/sdk";
import { tools } from "../tools";
import { MessageStatus } from "../messages";
import { Message } from "../context/messages";
import { logger } from "../logger";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { OpenResponsesUsage } from "@openrouter/sdk/esm/models";

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
  }: {
    data: Message[];
    callback: (msg: Message) => void;
    onUsageData: (data: OpenResponsesUsage) => void;
  }) {
    const model = "x-ai/grok-4.1-fast";
    logger.log(`callModel: model=${model} inputLen=${data.length}`);

    try {
      const result = openrouter.callModel({
        model,
        input: data
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
        tools: tools,
      });

      const callIdToName = new Map<string, string>();

      for await (const item of result.getItemsStream()) {
        logger.debug(`stream item: type=${item.type}`);
        if (item.status === "completed") {
          await saveRawOutput(item);
        }
        switch (item.type) {
          case "message":
            logger.debug(`message:`, item.content);
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
            callIdToName.set(item.callId, item.name);
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
            let metadata: Record<string, unknown> | undefined;
            try {
              const parsed = JSON.parse(item.output);
              if (parsed && typeof parsed === "object" && parsed.metadata) {
                metadata = parsed.metadata as Record<string, unknown>;
              }
            } catch {
              // non-JSON output — metadata stays undefined
            }
            const toolName = callIdToName.get(item.callId);
            if (toolName) {
              metadata = { ...(metadata ?? {}), name: toolName };
            }
            callback({
              type: item.type,
              id: item.id,
              callId: item.callId,
              output: item.output,
              status: item.status as MessageStatus | undefined,
              ...(metadata !== undefined && { metadata }),
            });
            break;
          }
        }
      }

      const response = await result.getResponse();
      logger.log("Setting useag", response.usage);
      onUsageData(response.usage);
    } catch (error) {
      logger.error("callModel error:", error);
      throw error;
    }
  }
}
