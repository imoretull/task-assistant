export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  system?: string;
  messages: LLMMessage[];
  /** Saved-prompt id, when the request came from the prompt library.
   *  Real providers ignore it; the MockProvider uses it to pick a
   *  deterministic transform so the full UX works offline. */
  promptId?: string;
}

export interface LLMProvider {
  readonly name: string;
  generate(opts: GenerateOptions): Promise<string>;
}

let cached: LLMProvider | null = null;

export async function getProvider(): Promise<LLMProvider> {
  if (cached) return cached;
  if ((process.env.LLM_PROVIDER ?? "mock").toLowerCase() === "claude") {
    const { ClaudeProvider } = await import("./claude.js");
    cached = new ClaudeProvider();
  } else {
    const { MockProvider } = await import("./mock.js");
    cached = new MockProvider();
  }
  return cached;
}
