const path = require('path')
require('dotenv').config({ path: path.join(__dirname, 'tests', '.env.test') })

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  displayName: 'node',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['dist'],
  coveragePathIgnorePatterns: ['mocks'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
