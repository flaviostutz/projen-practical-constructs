/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../common/test-project';

import { LintTarget } from './lint';
import { TaskOptions } from './tasks';

test('LintTarget is synthesized correctly', () => {
  const project = new TestProject();
  project.tasks.addTask('lint');
  project.tasks.addTask('lint-fix');
  const taskOpts: TaskOptions = { venvPath: '.venv' };
  new LintTarget(project, taskOpts);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});
