import { bashTool } from "./bash/bash";
import { editTool } from "./edit/edit";
import { globTool } from "./glob/glob";
import { grepTool } from "./grep/grep";
import { listTool } from "./ls/ls";
import { readTool } from "./read/read";
import { webfetchTool } from "./webfetch/webfetch";
import { websearchTool } from "./websearch/websearch";
import { writeTool } from "./write/write";

export const tools = [
  readTool,
  bashTool,
  editTool,
  writeTool,
  websearchTool,
  webfetchTool,
  listTool,
  grepTool,
  globTool,
];
