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
  signal?: AbortSignal;
}

function toolUseOf(message: Anthropic.Message): Anthropic.ToolUseBlock | undefined {
  return message.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
}

/**
 * Forced tool call -> zod parse -> one retry with the validation error fed back -> typed error.
 * The system prompt carries cache_control so repeat calls reuse it when it is long enough.
 */
export async function callTool<T>(args: CallToolArgs<T>): Promise<T> {
  const { model, system, maxTokens, tool, content, signal } = args;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content }];
  let lastProblem = "no tool call returned";

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getClient().messages.create(
      {
        model,
        max_tokens: maxTokens,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        tools: [{ name: tool.name, description: tool.description, input_schema: tool.inputSchema as Anthropic.Tool.InputSchema }],
        tool_choice: { type: "tool", name: tool.name },
        messages,
      },
      { signal },
    );

    const block = toolUseOf(response);
    const parsed = block ? tool.schema.safeParse(block.input) : null;
    if (parsed?.success) return parsed.data;

    lastProblem = !block
      ? `no tool call (stop_reason: ${response.stop_reason})`
      : parsed && !parsed.success
        ? parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")
        : lastProblem;
    if (!block) break;

    messages.push(
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: block.id,
            is_error: true,
            content: `Your output failed validation: ${lastProblem}. Call the tool again with a corrected, complete result.`,
          },
        ],
      },
    );
  }

  throw new ModelOutputError("The model returned output that failed validation.", lastProblem);
}
