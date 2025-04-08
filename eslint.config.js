import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  // Global configuration for all files
  {
    ignores: ['build/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      // Base ESLint rules
      'no-console': ['error', { allow: ['error', 'warn', 'info'] }],
      'no-unused-vars': 'off', // Turned off in favor of TypeScript version

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      // Disabled due to compatibility issues with flat config
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Prettier rules
      'prettier/prettier': 'error',
    },
  },
];
