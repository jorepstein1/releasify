// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  // Configure language/parsing options
  {
    languageOptions: {
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
