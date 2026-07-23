import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/generated/**",
      "**/prisma/generated/**",
      "**/.vite/**",
      "**/.tmp/**"
    ],
  },
  
  // Base configuration for all JavaScript/TypeScript files
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "prettier": prettierPlugin,
      "import": importPlugin,
      "unused-imports": unusedImportsPlugin
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      
      // Unused imports and variables
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ],
      
      // Import ordering
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "pathGroups": [
            { "pattern": "@/**", "group": "internal" }
          ],
          "alphabetize": { "order": "asc", "caseInsensitive": true },
          "newlines-between": "always"
        }
      ]
    }
  },

  // Backend
  {
    files: ["apps/backend/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // Frontend
  {
    files: ["apps/frontend/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { "allowConstantExport": true }
      ]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },

  // Scripts
  {
    files: ["scripts/**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },

  // Configuration files
  {
    files: ["**/*.config.{js,ts,mjs,cjs}", "eslint.config.mjs"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
);
