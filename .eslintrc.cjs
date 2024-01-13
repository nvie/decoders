/* eslint-disable */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },

  env: {
    es6: true,
    jest: true,
  },

  plugins: [
    '@typescript-eslint',
    'eslint-plugin-import',
    'eslint-plugin-simple-import-sort',
  ],

  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],

  globals: {
    process: false,
  },

  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',

    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],

    '@typescript-eslint/no-unused-vars': [
      'warn',
      // Unused variables are fine if they start with an underscore
      { args: 'all', argsIgnorePattern: '^_.*', varsIgnorePattern: '^_.*' },
    ],

    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops are never what you want. Use for..of, or use a .forEach() instead.',
      },
    ],

    // --------------------------------------------------------------
    // "The Code is the To-Do List"
    // https://www.executeprogram.com/blog/the-code-is-the-to-do-list
    // --------------------------------------------------------------
    'no-warning-comments': ['error', { terms: ['xxx'], location: 'anywhere' }],
  },

  // Relax ESLint a bit in tests
  overrides: [
    {
      files: ['test/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
