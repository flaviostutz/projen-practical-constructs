import { cdk, JsonPatch } from 'projen';
import { NodePackageManager, UpdateSnapshot } from 'projen/lib/javascript';

const project = new cdk.JsiiProject({
  name: 'projen-python',
  packageName: 'projen-python',
  author: 'Flavio Stutz',
  authorAddress: 'flaviostutz@gmail.com',
  description: 'Constructs and utilities for managing Python based projects with Projen enforcing solid build, test and linting structures',
  jsiiVersion: '~5.7.0',
  deps: [
    '@iarna/toml@^2.2.5',
  ],
  // every lib that is not jsii needs to be bundled in the final package
  bundledDeps: [
    '@iarna/toml'
  ],
  devDeps: [
    "@stutzlab/eslint-config@^3.1.1",
    "@typescript-eslint/eslint-plugin@^7.15.0",
    '@swc/core-linux-x64-gnu^1.10.8',
  ],
  peerDeps: [
    'projen@^0.91.6',
    'constructs@^10.4.2',
  ],
  publishToPypi: {
    distName: "projen_python",
    module: "projen_python",
  },
  defaultReleaseBranch: 'main',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/flaviostutz/projen-python.git',
  github: false,
  typescriptVersion: '5.5.4',
  projenrcTsOptions: {
    swc: true,
  },
  commitGenerated: false,
  license: 'MIT',
  docgen: false,
  packageManager: NodePackageManager.NPM, // PNPM doesn't work with jsii
  pnpmVersion: '',
  eslint: false,
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
    jestConfig: {
      collectCoverage: true,
      coverageReporters: ['text', 'lcov', 'cobertura'],
      collectCoverageFrom: ["src/**/*.ts", ".*\.test.ts"],
      testPathIgnorePatterns: ["src/.*/test.ts"], 
      coverageThreshold: {
        branches: 60,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

project.synth();
