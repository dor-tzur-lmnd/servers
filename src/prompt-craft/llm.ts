/**
 * LLM Service for Nexus Gateway Integration
 *
 * This service connects to Lemonade's internal Nexus LLM gateway.
 * Note: We use inline implementations for randomString and model constants
 * instead of @lemonade-hq packages to avoid cantina directory structure
 * requirements that don't apply to standalone MCP servers.
 *
 * The Nexus gateway handles all authentication, so the API key is just
 * a dummy value.
 */

import OpenAI from "openai";

// Simple random string generator for dummy API key
// (Nexus handles actual authentication)
function randomString(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Model constant - matches what's used in llmnd
const DEFAULT_MODEL = "anthropic/claude-opus-4-20250514";

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  // Note: thinking parameters are included for future compatibility
  // but are not currently supported by Anthropic models through Nexus
  thinkingEnabled?: boolean;
  thinkingBudget?: number;
}

export class VanillaOpenAIService {
  private openai: OpenAI;
  private defaultOptions: Required<LLMOptions>;

  constructor(options?: LLMOptions) {
    this.openai = new OpenAI({
      apiKey: randomString(), // Dummy key - Nexus handles auth
      baseURL: this.getBaseURL(),
    });

    // Set defaults
    // Note: thinkingEnabled and thinkingBudget are stored but not used
    // as they're not currently supported by Anthropic models through Nexus
    this.defaultOptions = {
      temperature: options?.temperature ?? 1.0,
      maxTokens: options?.maxTokens ?? 32000,
      thinkingEnabled: options?.thinkingEnabled ?? true,
      thinkingBudget: options?.thinkingBudget ?? 16000,
    };
  }

  private getBaseURL(): string {
    const baseUrlEnvValue =
      process.env.LLM_BASE_URL ?? process.env.OPENAI_BASE_URL;
    if (baseUrlEnvValue != null) {
      return baseUrlEnvValue;
    }

    // Check NODE_ENV to determine stage
    const isProdLike =
      process.env.NODE_ENV === "production" ||
      process.env.STAGE === "production";

    if (isProdLike) {
      return "https://nexus-production.lmndprod.com";
    }

    return "https://nexus-master.lmndstaging.com";
  }

  async chat(
    message: string,
    systemPrompt?: string,
    options?: LLMOptions
  ): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: message });

    const completion = await this.openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? this.defaultOptions.temperature,
      max_tokens: options?.maxTokens ?? this.defaultOptions.maxTokens,
    });

    return completion.choices[0].message.content ?? "";
  }

  async streamChat(
    message: string,
    systemPrompt?: string,
    options?: LLMOptions
  ): Promise<void> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: message });

    const stream = await this.openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      stream: true,
      temperature: options?.temperature ?? this.defaultOptions.temperature,
      max_tokens: options?.maxTokens ?? this.defaultOptions.maxTokens,
    }) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
    }
  }
}
