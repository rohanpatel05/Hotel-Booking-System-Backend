module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    moduleFileExtensions: ['js'],
    moduleNameMapper: {
        '^@controllers/(.*)$': '<rootDir>/controllers/$1',
        '^@models/(.*)$': '<rootDir>/models/$1',
        '^@middlewares/(.*)$': '<rootDir>/middleware/$1',
        '^@config/(.*)$': '<rootDir>/config/$1',
        '^@routes/(.*)$': '<rootDir>/routes/$1',
    },
};
