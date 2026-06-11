import Anthropic from "@anthropic-ai/sdk";
import type { GenerateOptions, LLMProvider } from "./provider.js";

/**
 * Real provider, wired but optional. Activated with LLM_PROVIDER=claude and
 * ANTHROPIC_API_KEY in the environment (see .env.example). The key lives only
 * in the sidecar — it is never exposed to the browser.
 */
export class ClaudeProvider implements LLMProvider {
  readonly name = "claude";
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "LLM_PROVIDER=claude but ANTHROPIC_API_KEY is not set. " +
          "Add it to .env or switch back to the MockProvider."
      );
    }
    this.client ??= new Anthropic(); // reads ANTHROPIC_API_KEY from env
    return this.client;
  }

  async generate({ system, messages }: GenerateOptions): Promise<string> {
    const response = await this.getClient().messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 8192,
      system,
      messages,
    });
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
  }
}
