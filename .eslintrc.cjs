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
