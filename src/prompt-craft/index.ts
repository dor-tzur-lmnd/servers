#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { VanillaOpenAIService } from "./llm.js";

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the system prompt and prompt guide
async function loadPrompts(): Promise<{
  systemPrompt: string;
  promptGuide: string;
}> {
  const systemPromptPath = path.join(__dirname, "prompts", "system-prompt.xml");
  const promptGuidePath = path.join(__dirname, "knowledge", "prompt-guide.md");

  const [systemPrompt, promptGuide] = await Promise.all([
    fs.readFile(systemPromptPath, "utf-8"),
    fs.readFile(promptGuidePath, "utf-8"),
  ]);

  return { systemPrompt, promptGuide };
}

class PromptCraftServer {
  private llmService: VanillaOpenAIService;
  private systemPrompt: string = "";
  private promptGuide: string = "";

  constructor() {
    this.llmService = new VanillaOpenAIService();
  }

  async initialize() {
    const prompts = await loadPrompts();
    this.systemPrompt = prompts.systemPrompt;
    this.promptGuide = prompts.promptGuide;
  }

  async enhancePrompt(prompt: string): Promise<string> {
    // Combine the system prompt with the prompt guide as context
    const fullSystemPrompt = `${this.systemPrompt}

<prompt_engineering_guide>
${this.promptGuide}
</prompt_engineering_guide>`;

    // Create the user message asking to enhance the prompt
    const userMessage = `Please analyze and enhance the following prompt according to the 10-Layer Architecture from the Prompt Engineering Guide V2:

<prompt_to_enhance>
${prompt}
</prompt_to_enhance>`;

    try {
      const enhancedPrompt = await this.llmService.chat(
        userMessage,
        fullSystemPrompt
      );
      return enhancedPrompt;
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      throw error;
    }
  }
}

// Create the MCP server
const server = new Server(
  {
    name: "prompt-craft",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const promptCraftServer = new PromptCraftServer();

// Initialize the server
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await promptCraftServer.initialize();
    initialized = true;
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "enhance_prompt",
        description:
          "Analyze and enhance a prompt using the 10-Layer Architecture from Prompt Engineering Guide V2. The tool will evaluate the prompt and provide an optimized version with structured improvements.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to analyze and enhance",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await ensureInitialized();

  const { name, arguments: args } = request.params;

  if (name === "enhance_prompt") {
    if (!args || typeof args.prompt !== "string") {
      throw new Error("Invalid arguments: 'prompt' must be a string");
    }

    try {
      const enhancedPrompt = await promptCraftServer.enhancePrompt(args.prompt);

      return {
        content: [
          {
            type: "text",
            text: enhancedPrompt,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error enhancing prompt: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptCraft MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
