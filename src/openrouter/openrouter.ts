import { OpenRouter } from "@openrouter/sdk";
import { tools } from "../tools";
import { MessageStatus } from "../messages";
import { Message } from "../context/messages";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export namespace OpenRouterProvider {
  export async function callModel({
    data,
    callback,
  }: {
    data: string;
    callback: (msg: Message) => void;
  }) {
    const result = openrouter.callModel({
      model: "stepfun/step-3.5-flash:free",
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

    const response = await result.getText();
    return response;
  }
}
