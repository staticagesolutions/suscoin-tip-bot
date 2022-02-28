/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "./test/.*test.ts$",
  maxWorkers: 1,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePaths: [
    '<rootDir>'
  ],
};