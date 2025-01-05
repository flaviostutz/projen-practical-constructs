import { cdk } from 'projen';
import { NodePackageManager, UpdateSnapshot } from 'projen/lib/javascript';

const project = new cdk.JsiiProject({
  author: 'Flavio Stutz',
  authorAddress: 'flaviostutz@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'projen-python',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/flaviostutz/projen-python.git',
  deps: [],
  devDeps: [],
  description: 'Constructs and utilities for managing Python based projects with Projen enforcing solid build, test and linting structures',
  packageName: 'projen-python',
  github: false,
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
  prettier: true,
  vscode: true,
  eslintOptions: {
    commandOptions: {
      fix: false,
    },
    dirs: ['src', 'test'],
  },
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
    jestConfig: {
      collectCoverage: true,
      coverageThreshold: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

project.synth();