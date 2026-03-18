import { tool } from "@openrouter/sdk";

import PLAN_INSTRUCTIONS from "../prompts/plan.txt";
import BUILD_INSTRUCTIONS from "../prompts/build.txt";
import EXPLORE_INSTRUCTIONS from "../prompts/explore.txt";
import GENERAL_INSTRUCTIONS from "../prompts/general.txt";
import COMPACTION_INSTRUCTIONS from "../prompts/compaction.txt";
import TITLE_INSTRUCTIONS from "../prompts/title.txt";
import SUMMARY_INSTRUCTIONS from "../prompts/summary.txt";

import { readTool } from "../tools/read/read";
import { globTool } from "../tools/glob/glob";
import { grepTool } from "../tools/grep/grep";
import { listTool } from "../tools/ls/ls";
import { websearchTool } from "../tools/websearch/websearch";
import { webfetchTool } from "../tools/webfetch/webfetch";
import { getTodosTool, writeTodosTool } from "../tools/todo/todo";
import { tools } from "../tools";
import { questionTool } from "../tools/question/question";

type Tool = ReturnType<typeof tool>;

export namespace AgentTool {
  export type Definition = {
    name: string;
    description: string;
    instructions: string;
    toolsList: Tool[];
    color: string;
    label: string;
    sigil: string;
    hidden?: boolean;
  };

  export function define(
    name: string,
    description: string,
    instructions: string,
    toolsList: Tool[],
    color: string,
    label: string,
    sigil: string,
    hidden?: boolean
  ): Definition {
    return {
      name,
      description,
      instructions,
      toolsList,
      color,
      label,
      sigil,
      hidden,
    };
  }
}

export namespace Agent {
  export const PLAN = AgentTool.define(
    "plan",
    "Analyzes the request and produces a step-by-step implementation plan before any code is written.",
    PLAN_INSTRUCTIONS,
    [
      readTool,
      globTool,
      grepTool,
      listTool,
      websearchTool,
      webfetchTool,
      writeTodosTool,
      getTodosTool,
      questionTool,
    ],
    "#a78bfa",
    "PLAN",
    "◈"
  );

  export const BUILD = AgentTool.define(
    "build",
    "Implements the plan by writing and modifying code in the codebase.",
    BUILD_INSTRUCTIONS,
    tools,
    "#34d399",
    "BUILD",
    "◆"
  );

  export const EXPLORE = AgentTool.define(
    "explore",
    "Searches and explores the codebase to find files, patterns, and relevant code.",
    EXPLORE_INSTRUCTIONS,
    [
      readTool,
      globTool,
      grepTool,
      listTool,
      websearchTool,
      webfetchTool,
      questionTool,
    ],
    "#60a5fa",
    "EXPLORE",
    "◎"
  );

  export const GENERAL = AgentTool.define(
    "general",
    "General-purpose agent for researching complex questions and executing multi-step tasks. Use this agent to execute multiple units of work in parallel.",
    GENERAL_INSTRUCTIONS,
    tools,
    "#f59e0b",
    "GENERAL",
    "◉"
  );

  export const COMPACTION = AgentTool.define(
    "compaction",
    "Compresses conversation history to reduce token usage while preserving essential context.",
    COMPACTION_INSTRUCTIONS,
    [],
    "#6b7280",
    "COMPACT",
    "⊙",
    true
  );

  export const TITLE = AgentTool.define(
    "title",
    "Generates a short descriptive title for a conversation or task.",
    TITLE_INSTRUCTIONS,
    [],
    "#6b7280",
    "TITLE",
    "T",
    true
  );

  export const SUMMARY = AgentTool.define(
    "summary",
    "Produces a concise summary of a conversation or set of results.",
    SUMMARY_INSTRUCTIONS,
    [],
    "#6b7280",
    "SUMMARY",
    "∑",
    true
  );
}
