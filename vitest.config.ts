import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      exclude: [".output/**", "node_modules/**", ".wxt/**"],
    },
    exclude: [".output/**", "node_modules/**", ".wxt/**"],
  },
})
