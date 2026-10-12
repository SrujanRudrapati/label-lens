export function isMock(): boolean {
  return process.env.MOCK_AI === "1";
}

export function samplesUseFixtures(): boolean {
  return process.env.SAMPLES_USE_FIXTURES === "1";
}

/** Lazily checked so mock mode and builds never need a key. */
export function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local or run with MOCK_AI=1.");
  }
  return key;
}
