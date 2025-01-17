/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestTarget } from './test';
import { TaskOptions } from './tasks';
import { TestProject } from './utils';

test('TestTarget is synthesized correctly', () => {
  const project = new TestProject();
  const taskOpts: TaskOptions = { venvPath: '.venv' };
  project.removeTask('build');
  project.removeTask('test');
  new TestTarget(project, taskOpts);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});
