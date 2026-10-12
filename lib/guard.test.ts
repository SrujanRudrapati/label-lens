import { beforeEach, describe, expect, test } from "vitest";
import { GuardError, MAX_BODY_BYTES, rateLimit, readJson, requireJpegBase64, resetRateLimit } from "./guard";

const jpegB64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46]).toString("base64");

function post(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://x/api", { method: "POST", body, headers });
}

describe("readJson", () => {
  test("parses a small JSON body", async () => {
    expect(await readJson(post('{"a":1}'))).toEqual({ a: 1 });
  });

  test("rejects a declared oversize body with 413", async () => {
    const req = post("{}", { "content-length": String(MAX_BODY_BYTES + 1) });
    await expect(readJson(req)).rejects.toMatchObject({ status: 413 });
  });

  test("rejects an undeclared oversize body with 413", async () => {
    await expect(readJson(post("x".repeat(200), {}), 100)).rejects.toMatchObject({ status: 413 });
  });

  test("rejects invalid JSON with 400", async () => {
    await expect(readJson(post("{nope"))).rejects.toMatchObject({ status: 400 });
  });
});

describe("requireJpegBase64", () => {
  test("accepts JPEG bytes and strips a data URL prefix", () => {
    expect(requireJpegBase64(`data:image/jpeg;base64,${jpegB64}`)).toBe(jpegB64);
  });

  test("rejects non-JPEG bytes", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]).toString("base64");
    expect(() => requireJpegBase64(png)).toThrow(GuardError);
  });

  test("rejects non-base64 text", () => {
    expect(() => requireJpegBase64("not base64!!")).toThrow(GuardError);
  });
});

describe("rateLimit", () => {
  beforeEach(resetRateLimit);

  test("allows a burst then answers 429, and refills over time", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4" } });
    const t0 = 1_000_000;
    for (let i = 0; i < 20; i++) rateLimit(req, t0);
    expect(() => rateLimit(req, t0)).toThrowError(expect.objectContaining({ status: 429 }));
    expect(() => rateLimit(req, t0 + 3_100)).not.toThrow();
  });

  test("tracks IPs separately", () => {
    const t0 = 2_000_000;
    const a = new Request("http://x", { headers: { "x-forwarded-for": "9.9.9.9" } });
    const b = new Request("http://x", { headers: { "x-forwarded-for": "8.8.8.8" } });
    for (let i = 0; i < 20; i++) rateLimit(a, t0);
    expect(() => rateLimit(b, t0)).not.toThrow();
  });
});

describe("rateLimit client identity", () => {
  test("a spoofed leading x-forwarded-for hop does not reset the bucket", () => {
    process.env.MOCK_AI = "";
    resetRateLimit();
    const spoofed = (n: number) => new Request("http://x/", { headers: { "x-forwarded-for": `10.0.0.${n}, 203.0.113.9` } });
    let blocked = false;
    for (let i = 0; i < 40; i++) {
      try {
        rateLimit(spoofed(i), 1_000);
      } catch {
        blocked = true;
      }
    }
    expect(blocked).toBe(true);
  });
});
