import { cdk, JsonPatch } from 'projen';
import { NodePackageManager, UpdateSnapshot } from 'projen/lib/javascript';

const project = new cdk.JsiiProject({
  author: 'Flavio Stutz',
  authorAddress: 'flaviostutz@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'projen-python',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/flaviostutz/projen-python.git',
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
  ],
  peerDeps: [
    'projen@^0.91.6',
    'constructs@^10.4.2',
  ],
  description: 'Constructs and utilities for managing Python based projects with Projen enforcing solid build, test and linting structures',
  packageName: 'projen-python',
  github: false,
  typescriptVersion: '5.5.4',
  projenrcTsOptions: {
    swc: true,
  },
  commitGenerated: false,
  license: 'MIT',
  docgen: true,
  packageManager: NodePackageManager.NPM, // PNPM doesn't work with jsii
  pnpmVersion: '',
  // publishToPypi: {
  //   distName: 'projen-python',
  //   module: 'projen_python',
  // },
  eslint: false,
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
    jestConfig: {
      collectCoverage: true,
      coverageThreshold: {
        branches: 30,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

project.synth();
