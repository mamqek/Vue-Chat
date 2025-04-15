export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest', // Use ts-jest for TypeScript files
  },
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  globals: {
    'ts-jest': {
      useESM: true, // Enable ESM in ts-jest
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Map @/ to the src directory
  },
  roots: ['<rootDir>/tests'], // Look for tests in the tests directory
};