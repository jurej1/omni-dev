import { OpenRouter } from "@openrouter/sdk";
import { tools } from "../tools";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export namespace OpenRouterProvider {
  export async function callModel(data: string) {
    const result = openrouter.callModel({
      model: "x-ai/grok-4.1-fast",
      input: data,
      tools: tools,
    });

    const response = await result.getText();
    return response;
  }
}
