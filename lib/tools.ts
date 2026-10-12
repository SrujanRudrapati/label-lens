import { z } from "zod";
import { Analysis, QuickResult } from "./schema";

export interface ToolDef<T> {
  name: string;
  description: string;
  schema: z.ZodType<T>;
  inputSchema: Record<string, unknown>;
}

/** One source of truth: the tool's JSON schema is generated from the zod schema. */
function defineTool<T>(name: string, description: string, schema: z.ZodType<T>): ToolDef<T> {
  const inputSchema = { ...z.toJSONSchema(schema) } as Record<string, unknown>;
  delete inputSchema.$schema;
  return { name, description, schema, inputSchema };
}

export const QUICK_TOOL = defineTool(
  "report_quick_read",
  "Report the fast first look at the label photo.",
  QuickResult,
);

export const ANALYSIS_TOOL = defineTool(
  "report_label_analysis",
  "Report the full plain-language analysis of the label for this person.",
  Analysis,
);
