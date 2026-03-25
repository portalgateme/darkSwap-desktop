import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        strict: false,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        skipLibCheck: true,
        target: 'ES2022',
        module: 'CommonJS',
        moduleResolution: 'node',
        resolveJsonModule: true,
        types: ['node', 'jest'],
      }
    }]
  }
}

export default config
