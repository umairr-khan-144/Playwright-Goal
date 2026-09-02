import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      // Playwright fixture callbacks conventionally destructure `{}` when no
      // fixture dependencies are needed - that is idiomatic here, not a mistake.
      'no-empty-pattern': 'off',
      'no-console': 'off',
    },
  },
  {
    // response.json() is inherently `any`; requiring casts/guards on every
    // JSON assertion in spec files would add noise without real safety value.
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  prettierConfig,
  {
    ignores: ['node_modules/', 'dist/', 'playwright-report/', 'test-results/', 'allure-report/', 'allure-results/'],
  },
];
