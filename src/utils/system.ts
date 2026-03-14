import HEADER from "../prompts/header.txt";

export namespace SystemPrompt {
  export function instructions() {
    return HEADER.trim();
  }
}
