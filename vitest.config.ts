import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root("./"),
      // server-only throws outside the Next server bundle; tests run in plain node.
      "server-only": root("./lib/test-stubs/server-only.ts"),
    },
  },
  test: { environment: "node", include: ["**/*.test.ts"], exclude: ["node_modules", ".next", "e2e"] },
});
