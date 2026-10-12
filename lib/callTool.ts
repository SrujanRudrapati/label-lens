import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getClient } from "./anthropic";
import type { ToolDef } from "./tools";

export class ModelOutputError extends Error {
  constructor(message: string, readonly detail: string) {
    super(message);
    this.name = "ModelOutputError";
  }
}

interface CallToolArgs<T> {
  model: string;
  system: string;
  maxTokens: number;
  tool: ToolDef<T>;
  content: Anthropic.ContentBlockParam[];
  thinking: Anthropic.ThinkingConfigParam;
  signal?: AbortSignal;
}

function toolUseOf(message: Anthropic.Message): Anthropic.ToolUseBlock | undefined {
  return message.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
}

/**
 * Tool call (tool_choice "auto" plus an explicit instruction: Sonnet 5.5 rejects forced tool_choice) -> zod parse -> one retry with the validation error fed back -> typed error.
 * The system prompt carries cache_control so repeat calls reuse it when it is long enough.
 */
export async function callTool<T>(args: CallToolArgs<T>): Promise<T> {
  const { model, system, maxTokens, tool, content, thinking, signal } = args;
  const systemText = `${system}\n\nRespond only by calling the ${tool.name} tool exactly once.`;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content }];
  let lastProblem = "no tool call returned";

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getClient().messages.create(
      {
        model,
        max_tokens: maxTokens,
        system: [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }],
        tools: [{ name: tool.name, description: tool.description, input_schema: tool.inputSchema as Anthropic.Tool.InputSchema }],
        tool_choice: { type: "auto", disable_parallel_tool_use: true },
        thinking,
        messages,
      },
      { signal },
    );

    const block = toolUseOf(response);
    if (response.content.filter((b) => b.type === "tool_use").length > 1) console.error(`[callTool] ${tool.name}: multiple tool_use blocks`);
    const parsed = block ? tool.schema.safeParse(block.input) : null;
    if (parsed?.success) return parsed.data;

    lastProblem = !block
      ? `no tool call (stop_reason: ${response.stop_reason})`
      : parsed && !parsed.success
        ? parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")
        : lastProblem;

    const retryNote = `Your output failed validation: ${lastProblem}. Call ${tool.name} again with a corrected, complete result.`;
    messages.push(
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: block
          ? response.content
              .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
              .map((b) => ({ type: "tool_result" as const, tool_use_id: b.id, is_error: true, content: retryNote }))
          : retryNote,
      },
    );
  }

  throw new ModelOutputError("The model returned output that failed validation.", lastProblem);
}
