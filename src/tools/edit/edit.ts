import { tool } from "@openrouter/sdk";
import { resolve } from "path";
import z from "zod";

export const editTool = tool({
  name: "edit",
  description:
    "Perform exact string replacement in a file. Replaces oldString with newString. The match must be unique unless replaceAll is true.",
  inputSchema: z.object({
    filePath: z.string().describe("The absolute path to the file to modify"),
    oldString: z.string().describe("The text to replace"),
    newString: z
      .string()
      .describe(
        "The text to replace it with (must be different from oldString)",
      ),
    replaceAll: z
      .boolean()
      .optional()
      .describe("Replace all occurrences of oldString (default false)"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the operation was successful"),
    replacements: z.number().describe("The number of replacements made"),
  }),
  execute: async ({ filePath, oldString, newString, replaceAll = false }) => {
    if (oldString === newString) {
      throw new Error(
        "No changes to appply: oldString and newString area idential",
      );
    }

    const absPath = resolve(filePath);
    const file = Bun.file(absPath);
    const exists = await file.exists();

    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (oldString === "") {
      await Bun.write(absPath, newString);
      return { success: true, replacements: 1 };
    }

    const content = await file.text();

    if (!content.includes(oldString)) {
      throw new Error(
        "Could not find oldString in the file. It must match exactly, including whitespace and indentation.",
      );
    }

    const occurrences = content.split(oldString).length - 1;
    if (!replaceAll && occurrences > 1) {
      throw new Error(
        `Found ${occurrences} matches for oldString. Provide more surrounding context or use replaceAll: true.`,
      );
    }

    const newContent = replaceAll
      ? content.split(oldString).join(newString)
      : content.replace(oldString, newString);

    await Bun.write(absPath, newContent);
    return { success: true, replacements: replaceAll ? occurrences : 1 };
  },
});
