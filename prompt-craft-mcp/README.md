# PromptCraft MCP Server

An MCP server that enhances prompts using the 10-Layer Architecture from the Prompt Engineering Guide V2. PromptCraft analyzes your prompts and provides optimized versions with structured improvements.

## Features

- **Intelligent Analysis**: Evaluates prompts against the comprehensive 10-Layer Architecture
- **Pragmatic Optimization**: Only suggests changes that provide meaningful improvement (>20% impact)
- **Structured Enhancement**: Transforms vague instructions into precision-engineered systems
- **Excellence Recognition**: Identifies and preserves already well-crafted elements
- **Comprehensive Feedback**: Provides detailed explanations for suggested improvements

## Tool

### enhance_prompt

Analyzes and enhances a prompt using expert prompt engineering principles.

**Input:**
- `prompt` (string): The prompt to analyze and enhance

**Output:**
- Enhanced prompt with structured improvements
- Assessment of the original prompt's strengths
- Specific optimizations applied (if needed)
- Explanation of why changes were made

## Installation

### NPM Package

```bash
npm install -g @modelcontextprotocol/server-prompt-craft
```

### From Source

```bash
git clone <repository-url>
cd prompt-craft-mcp
npm install
npm run build
```

## Usage

### With Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prompt-craft": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-prompt-craft"
      ]
    }
  }
}
```

### With VS Code

Add this to your VS Code settings or `.vscode/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "prompt-craft": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-prompt-craft"
        ]
      }
    }
  }
}
```

### Direct Usage

```bash
# Run the server
npm start

# Or run in development mode
npm run dev
```

## Configuration

### Environment Variables

- `LLM_BASE_URL` or `OPENAI_BASE_URL`: Custom LLM endpoint (optional, defaults to internal Nexus gateway)
- `NODE_ENV` or `STAGE`: Set to "production" to use production Nexus endpoint

## Examples

### Basic Enhancement

```
Input: "You are a helpful AI assistant. Answer questions accurately and be nice."

Output: 
## Assessment: Optimization Opportunities

**Core Issues:**
1. **Vague Identity** - Guide Page 2, Layer 1
   Impact: Without specific expertise, responses lack consistency
   
2. **No Capability Boundaries** - Guide Page 3, Layer 2  
   Impact: Uncertain scope leads to inconsistent quality

**Optimized Version:**
<identity>
  <role>You are Atlas, a research assistant specializing in academic sources</role>
  <personality>Analytical, thorough, and academically rigorous</personality>
  <communication_style>Clear and precise, with appropriate citations</communication_style>
</identity>

<capabilities>
  <can_do>
    - Find and analyze academic sources
    - Explain complex topics clearly
    - Suggest research directions
  </can_do>
  <cannot_do>
    - Access paywalled content
    - Provide medical/legal advice
  </cannot_do>
</capabilities>
```

### Already Excellent Prompt

```
Input: [Well-structured prompt with clear identity, boundaries, and decision logic]

Output:
## Assessment: Excellent Prompt ✓

**Why This Works:**
- **Strong Identity Layer**: Clear role definition with expertise boundaries
- **Smart Capability Boundaries**: Explicit limitations prevent overreach
- **Elegant Decision Architecture**: Confidence thresholds handle uncertainty gracefully

**Particularly Elegant Elements:**
Your use of behavioral anchors creates consistent tone without being prescriptive.

**Optional Enhancement:**
Consider adding one edge case example for handling conflicting requirements.
```

## How It Works

PromptCraft uses a sophisticated analysis system based on the 10-Layer Architecture:

1. **Identity & Persona** - Establishes clear role and communication style
2. **Capabilities & Boundaries** - Defines what the AI can and cannot do
3. **Behavioral Rules** - Sets priorities and conflict resolution
4. **Decision Architecture** - Converts ambiguity into explicit logic
5. **Output Specifications** - Defines exact formats with examples
6. **Meta-Cognitive Instructions** - Teaches how to think, not just what to do
7. **Examples as Specifications** - Provides executable documentation
8. **Progressive Complexity** - Scales responses to query complexity
9. **Context Awareness** - Enables dynamic adaptation
10. **Quality Standards** - Defines excellence criteria

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Verify Code Quality

```bash
npm run verify
```

## Project Structure

```
prompt-craft-mcp/
├── src/
│   ├── index.ts           # Main MCP server implementation
│   └── llm.ts            # LLM service for Nexus integration
├── prompts/
│   └── system-prompt.xml  # Core system prompt for PromptCraft
├── knowledge/
│   └── prompt-guide.md    # Comprehensive prompt engineering guide
├── package.json
├── tsconfig.json
└── README.md
```

## License

This MCP server is licensed under the MIT License. See the LICENSE file in the project repository for details.
