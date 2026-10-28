import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Ignore generated / vendor output
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'test-results/**',
      'playwright-report/**',
      'playwright-report-api/**',
      'blob-report/**',
      'playwright/.cache/**',
      'output/**',
    ],
  },

  // Base JS + TypeScript recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide language options
  {
    files: ['**/*.{ts,js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Allow intentionally unused args/vars prefixed with "_"
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Tests sometimes need flexible typing for API payloads
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Playwright-specific rules for spec / test files
  {
    ...playwright.configs['flat/recommended'],
    files: ['**/*.spec.ts', '**/*.test.ts'],
  },

  // Keep Prettier last so it disables conflicting formatting rules
  prettier,
);
