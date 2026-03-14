import { tool } from "@openrouter/sdk";

import PLAN_INSTRUCTIONS from "../prompts/plan.txt";
import BUILD_INSTRUCTIONS from "../prompts/build.txt";

import { readTool } from "../tools/read/read";
import { globTool } from "../tools/glob/glob";
import { grepTool } from "../tools/grep/grep";
import { listTool } from "../tools/ls/ls";
import { websearchTool } from "../tools/websearch/websearch";
import { webfetchTool } from "../tools/webfetch/webfetch";
import { bashTool } from "../tools/bash/bash";
import { editTool } from "../tools/edit/edit";
import { writeTool } from "../tools/write/write";

type Tool = ReturnType<typeof tool>;

export namespace AgentTool {
  export type Definition = {
    name: string;
    description: string;
    instructions: string;
    toolsList: Tool[];
  };

  export function define(
    name: string,
    description: string,
    instructions: string,
    toolsList: Tool[],
  ): Definition {
    return { name, description, instructions, toolsList };
  }
}

export namespace Agent {
  export const PLAN = AgentTool.define(
    "plan",
    "Analyzes the request and produces a step-by-step implementation plan before any code is written.",
    PLAN_INSTRUCTIONS,
    [readTool, globTool, grepTool, listTool, websearchTool, webfetchTool],
  );

  export const BUILD = AgentTool.define(
    "build",
    "Implements the plan by writing and modifying code in the codebase.",
    BUILD_INSTRUCTIONS,
    [
      readTool,
      globTool,
      grepTool,
      listTool,
      websearchTool,
      webfetchTool,
      bashTool,
      editTool,
      writeTool,
    ],
  );
}
