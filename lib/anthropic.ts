import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "./env";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: getApiKey(), maxRetries: 1 });
  return client;
}
