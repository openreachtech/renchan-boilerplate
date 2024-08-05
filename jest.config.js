'use strict'

module.exports = {
  setupFilesAfterEnv: [
    '@openreachtech/renchan-test-tools/lib/environment/setupAfterEnv.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
}
