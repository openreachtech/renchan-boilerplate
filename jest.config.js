export default {
  setupFilesAfterEnv: [
    '@openreachtech/renchan-test-tools/lib/environment/setupAfterEnv.js',
  ],
  moduleNameMapper: {
    '^(@.*)$': '<rootDir>/node_modules/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^sequelize/(.*)$': '<rootDir>/node_modules/sequelize/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
