/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../common/test-project';

import { BuildTarget } from './build';
import { TaskOptions } from './tasks';

describe('BuildTarget', () => {
  test('BuildTarget is synthesized correctly', () => {
    const project = new TestProject();
    const taskOpts: TaskOptions = { venvPath: '.venv' };
    project.removeTask('build');
    new BuildTarget(project, taskOpts);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });

  test('BuildTarget synthesizes correctly', () => {
    const project = new TestProject();
    const taskOpts: TaskOptions = { venvPath: '.venv' };
    project.removeTask('build');
    new BuildTarget(project, taskOpts, {
      package: {
        version: '1.2.3',
      },
      pip: {
        pythonExec: 'python3',
      },
    });
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });
});
