import { cdk } from 'projen';
import { NodePackageManager, UpdateSnapshot } from 'projen/lib/javascript';
import { ReleaseTrigger } from 'projen/lib/release';
import { ProjenStruct, Struct } from "@mrgrain/jsii-struct-builder";
import {tsToJsii} from './src/';

const project = new cdk.JsiiProject({
  name: 'projen-practical-constructs',
  packageName: 'projen-practical-constructs',
  author: 'Flavio Stutz',
  authorAddress: 'flaviostutz@gmail.com',
  description: 'Constructs and utilities for managing projects (Python, NodeJS etc) with Projen enforcing solid build, test and linting structures',
  jsiiVersion: '~5.7.0',
  deps: [
    '@iarna/toml@^2.2.5',
    '@jsii/spec@^1.112.0',
    '@mrgrain/jsii-struct-builder@^0.7.52',
    'ts-morph@^26.0.0',
  ],
  // every lib that is not jsii needs to be bundled in the final package
  bundledDeps: [
    '@iarna/toml@2.2.5',
    '@jsii/spec@^1.112.0',
    '@mrgrain/jsii-struct-builder@^0.7.52',
    'ts-morph@^26.0.0',
  ],
  devDeps: [
    "@stutzlab/eslint-config@^3.2.1",
    "@typescript-eslint/eslint-plugin@^7.15.0",
  ],
  peerDeps: [
    'projen@^0.91.13',
    'constructs@^10.4.2',
  ],
  publishToPypi: {
    distName: "projen_practical_constructs",
    module: "projen_practical_constructs",
  },
  releaseTrigger: ReleaseTrigger.manual(),
  github: false,
  defaultReleaseBranch: 'main',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/flaviostutz/projen-practical-constructs.git',
  typescriptVersion: '5.5.4',
  projenrcTsOptions: {
    swc: true,
  },
  license: 'MIT',
  docgen: false,
  packageManager: NodePackageManager.NPM, // PNPM doesn't work with jsii
  // pnpmVersion: '',
  eslint: false,
  jestOptions: {
    updateSnapshot: UpdateSnapshot.NEVER,
    jestConfig: {
      collectCoverage: true,
      coverageReporters: ['text', 'lcov', 'cobertura'],
      collectCoverageFrom: ["src/**/*.ts", "src/.*\.test.ts"],
      testPathIgnorePatterns: ["src/.*/test.ts", "test/.*"], 
      coverageThreshold: {
        branches: 60,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

project.tasks.addTask('package-release', {
  description: 'Package using the latest git tag as version',
  steps: [
    {
      "exec": "rm -fr dist"
    },
    {
      "spawn": "bump"
    },
    {
      "spawn": "compile"
    },
    {
      "spawn": "package-all"
    },
    {
      "spawn": "unbump"
    },
  ]
});

project.addGitIgnore('.npmrc');

new ProjenStruct(project, { name: 'SpikeTypeOptional', filePath: 'src/spike-generated.ts' })
  .mixin(tsToJsii('src/spike.ts', 'SpikeType'))
  .allOptional();

project.synth();
