import js from "@eslint/js"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier"

const sharedGlobals = {
  ...globals.browser,
  chrome: "readonly",
}

const sharedRules = {
  eqeqeq: "error",
  "no-var": "error",
  "prefer-const": "error",
  "prefer-template": "error",
  "prefer-arrow-callback": "error",
  "no-unused-vars": "warn",
}

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ["node_modules/", "docs/", "*.png", "*.svg"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: sharedGlobals,
    },
    rules: sharedRules,
  },
]
