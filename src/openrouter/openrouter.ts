import { OpenRouter } from "@openrouter/sdk";
import { tools } from "../tools";
import { MessageStatus } from "../messages";
import { Message } from "../context/messages";
import { logger } from "../logger";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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
  }: {
    data: string;
    callback: (msg: Message) => void;
  }) {
    const model = "stepfun/step-3.5-flash:free";
    logger.log(`callModel: model=${model} inputLen=${data.length}`);

    try {
      const result = openrouter.callModel({
        model,
        input: data,
        tools: tools,
      });

      for await (const item of result.getItemsStream()) {
        logger.debug(`stream item: type=${item.type}`);
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
          case "function_call_output":
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
    } catch (error) {
      logger.error("callModel error:", error);
      throw error;
    }
  }
}
