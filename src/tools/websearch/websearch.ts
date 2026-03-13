import { tool } from "@openrouter/sdk";
import { z } from "zod";
import * as DESCRIPTION from "./websearch.txt";

const EXA_MCP_URL = "https://mcp.exa.ai/mcp";
const DEFAULT_NUM_RESULTS = 8;

export const websearchTool = tool({
  name: "websearch",
  description: DESCRIPTION,
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    numResults: z
      .number()
      .optional()
      .describe("Number of search results to return (default: 8)"),
    livecrawl: z
      .enum(["fallback", "preferred"])
      .optional()
      .describe(
        "'fallback': use live crawling as backup, 'preferred': prioritize live crawling (default: 'fallback')",
      ),
    type: z
      .enum(["auto", "fast", "deep"])
      .optional()
      .describe(
        "'auto': balanced (default), 'fast': quick, 'deep': comprehensive",
      ),
    contextMaxCharacters: z
      .number()
      .optional()
      .describe("Maximum characters for context (default: 10000)"),
  }),
  outputSchema: z.object({
    results: z.string(),
  }),
  execute: async ({
    query,
    numResults,
    livecrawl,
    type,
    contextMaxCharacters,
  }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);

    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "web_search_exa",
        arguments: {
          query,
          type: type ?? "auto",
          numResults: numResults ?? DEFAULT_NUM_RESULTS,
          livecrawl: livecrawl ?? "fallback",
          ...(contextMaxCharacters !== undefined && { contextMaxCharacters }),
        },
      },
    });

    const response = await fetch(EXA_MCP_URL, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search failed (${response.status}): ${errorText}`);
    }

    const responseText = await response.text();

    for (const line of responseText.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = JSON.parse(line.substring(6));
      if (data.result?.content?.length > 0) {
        return { results: data.result.content[0].text };
      }
    }

    return {
      results: "No search results found. Please try a different query.",
    };
  },
});
