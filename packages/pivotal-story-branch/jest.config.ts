/* eslint-disable */
export default {
  displayName: 'pivotal-story-branch',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: [`<rootDir>/jest.setup.ts`],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/pivotal-story-branch',
}
