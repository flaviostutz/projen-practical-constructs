/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../test-project';

import { BaseTooling } from './base-tooling';

test('base tooling for projen projects', () => {
  const project = new TestProject();
  new BaseTooling(project);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});
