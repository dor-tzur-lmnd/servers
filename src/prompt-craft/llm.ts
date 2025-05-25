import OpenAI from "openai";
import { randomString } from "@lemonade-hq/cantina-core";
import { ModelNames } from "@lemonade-hq/llmnd";

export class VanillaOpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: randomString(), // Dummy key - Nexus handles auth
      baseURL: this.getBaseURL(),
    });
  }

  private getBaseURL(): string {
    const baseUrlEnvValue =
      process.env.LLM_BASE_URL ?? process.env.OPENAI_BASE_URL;
    if (baseUrlEnvValue != null) {
      return baseUrlEnvValue;
    }

    if (this.appContext.isProdLikeStage()) {
      return "https://nexus-production.lmndprod.com";
    }

    return "https://nexus-master.lmndstaging.com";
  }

  async chat(message: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: ModelNames.OpenAi.Gpt4o,
      messages: [{ role: "user", content: message }],
    });

    return completion.choices[0].message.content ?? "";
  }

  async streamChat(message: string): Promise<void> {
    const stream = await this.openai.chat.completions.create({
      model: ModelNames.OpenAi.Gpt4o,
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
    }
  }
}
