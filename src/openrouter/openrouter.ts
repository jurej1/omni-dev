import { OpenRouter } from "@openrouter/sdk";
import { tools } from "../tools";
import { MessageItem, MessageStatus } from "../messages";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export namespace OpenRouterProvider {
  export async function callModel({
    data,
    callback,
  }: {
    data: string;
    callback: (msg: MessageItem) => void;
  }) {
    const result = openrouter.callModel({
      model: "z-ai/glm-4.5-air:free",
      input: data,
      tools: tools,
    });

    for await (const item of result.getItemsStream()) {
      switch (item.type) {
        case "message":
          callback({
            type: item.type,
            id: item.id,
            role: item.role,
            status: item.status as MessageStatus | undefined,
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
            status: item.status as MessageStatus | undefined,
          });
          break;
        case "reasoning":
          callback({
            type: item.type,
            id: item.id,
            summary: item.summary,
            status: item.status as MessageStatus | undefined,
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
  }
}
