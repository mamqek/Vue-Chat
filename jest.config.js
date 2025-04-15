module.exports = {
    testEnvironment: 'node', // Use Node.js environment for testing
    transform: {
        '^.+\\.js$': 'babel-jest', // Use Babel to transform ES modules
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // Map @/ to the src directory
    },
    roots: ['<rootDir>/tests'], // Look for tests in the tests directory
};