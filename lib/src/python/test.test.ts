/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../common/test-project';

import { TestTarget } from './test';
import { TaskOptions } from './tasks';

test('TestTarget is synthesized correctly', () => {
  const project = new TestProject();
  const taskOpts: TaskOptions = { venvPath: '.venv' };
  project.removeTask('build');
  project.removeTask('test');
  new TestTarget(project, taskOpts);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});
