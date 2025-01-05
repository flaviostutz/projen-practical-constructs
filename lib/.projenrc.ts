import { cdk } from 'projen';

const project = new cdk.JsiiProject({
  author: 'Flavio Stutz',
  authorAddress: 'flaviostutz@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  name: 'lib',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/flaviostutz/projen-python.git',
  deps: [],
  devDeps: [],
  description: 'Constructs and utilities for managing Python based projects with Projen enforcing solid build, test and linting structures',
  packageName: 'projen-python',
});

project.synth();