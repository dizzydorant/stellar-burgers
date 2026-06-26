export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@ui-pages$': '<rootDir>/src/components/ui/pages',
    '^@api$': '<rootDir>/src/utils/burger-api.ts'
  }
};
