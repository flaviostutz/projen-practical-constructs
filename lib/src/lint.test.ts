/* eslint-disable no-new */
import { Testing } from 'projen';

import { LintTarget } from './lint';
import { TaskOptions } from './tasks';
import { TestProject } from './utils';

test('LintTarget is synthesized correctly', () => {
  const project = new TestProject();
  const taskOpts: TaskOptions = { venvPath: '.venv' };
  new LintTarget(project, taskOpts);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});

test('LintTarget synthesizes correctly', () => {
  const project = Testing.project();
  const taskOpts: TaskOptions = { venvPath: '.venv' };
  new LintTarget(project, taskOpts);
  const output = Testing.synth(project);
  expect(output).toBeDefined();
});
