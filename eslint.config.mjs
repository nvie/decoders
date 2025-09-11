import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsParser from '@typescript-eslint/parser';
import eslint from '@eslint/js';

export default tseslint.config(
  { ignores: ['dist/*', 'coverage/*', 'node_modules/*'] },

  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  },

  // -----------------------------
  // Enable these checks
  // -----------------------------
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      quotes: ['error', 'single', 'avoid-escape'],
      'object-shorthand': 'error',

      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'all', argsIgnorePattern: '^_.*', varsIgnorePattern: '^_.*' },
      ],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',

      // --------------------------------------------------------------
      // "The Code is the To-Do List"
      // https://www.executeprogram.com/blog/the-code-is-the-to-do-list
      // --------------------------------------------------------------
      'no-warning-comments': ['error', { terms: ['xxx'], location: 'anywhere' }],
    },
  },

  // -------------------------------
  // Disable these checks
  // -------------------------------
  {
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off', // Because we have a custom no-restricted-syntax rule for this
      'no-constant-condition': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    },
  },

  // Overrides for tests specifically
  {
    files: ['test/**'],

    // Relax ESLint a bit in tests
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
);
