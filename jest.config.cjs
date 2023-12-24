/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules', '_fixtures.ts', 'test-d'],

  // NOTE: These alias mapping must exactly match the mappings from the "paths"
  // setting in our tsconfig
  moduleNameMapper: {
    '^~$': '<rootDir>/src',
    '^~/(.*)$': '<rootDir>/src/$1',
  },
};
