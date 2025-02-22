/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../common/test-project';
import { CommonTargets } from '../common/components/common-target-type';

import { BuildTarget } from './build';
import { TaskOptions } from './tasks';

describe('BuildTarget', () => {
  test('BuildTarget is synthesized correctly', () => {
    const project = new TestProject();
    const taskOpts: TaskOptions = { venvPath: '.venv' };
    project.removeTask(CommonTargets.BUILD);
    project.addTask(CommonTargets.BUILD);
    project.addTask(CommonTargets.INSTALL);
    project.addTask(CommonTargets.PREPARE);
    new BuildTarget(project, taskOpts);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });

  test('BuildTarget synthesizes correctly', () => {
    const project = new TestProject();
    const taskOpts: TaskOptions = { venvPath: '.venv' };
    project.removeTask(CommonTargets.BUILD);
    project.addTask(CommonTargets.BUILD);
    project.addTask(CommonTargets.INSTALL);
    project.addTask(CommonTargets.PREPARE);
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
