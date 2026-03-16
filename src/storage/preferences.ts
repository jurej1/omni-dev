import { homedir } from "node:os";
import { logger } from "../logger";

const PREFS_DIR = `${homedir()}/.omni-dev`;
const PREFS_PATH = `${PREFS_DIR}/preferences.json`;

interface Preferences {
  selectedModelId?: string;
  reasoningEffort?: string;
}

async function readPreferences(): Promise<Preferences> {
  try {
    const file = Bun.file(PREFS_PATH);
    const text = await file.text();
    return JSON.parse(text) as Preferences;
  } catch {
    return {};
  }
}

export namespace PreferencesUtil {
  export async function getSelectedModelId(): Promise<string | null> {
    const prefs = await readPreferences();
    return prefs.selectedModelId ?? null;
  }

  export async function saveSelectedModelId(modelId: string): Promise<void> {
    try {
      const prefs = await readPreferences();
      await Bun.write(
        PREFS_PATH,
        JSON.stringify({ ...prefs, selectedModelId: modelId }),
      );
    } catch (error) {
      logger.error("Failed to save preferences:", error);
    }
  }

  export async function getReasoningEffort(): Promise<string | null> {
    const prefs = await readPreferences();
    return prefs.reasoningEffort ?? null;
  }

  export async function saveReasoningEffort(effort: string): Promise<void> {
    try {
      const prefs = await readPreferences();
      await Bun.write(
        PREFS_PATH,
        JSON.stringify({ ...prefs, reasoningEffort: effort }),
      );
    } catch (error) {
      logger.error("Failed to save preferences:", error);
    }
  }
}
