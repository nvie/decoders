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
        selector: 'ForOfStatement',
        message:
          'Avoid for..of loops in libraries, because they generate unneeded Babel iterator runtime support code in the bundle',
      },
      {
        selector: 'ForInStatement',
        message:
          'for..in loops are never what you want. Loop over Object.keys() instead.',
      },
    ],
  },
};
