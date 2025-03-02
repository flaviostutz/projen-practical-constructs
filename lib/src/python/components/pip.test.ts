/* eslint-disable no-new */

import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';
import { CommonTargets } from '../../common/components/common-target-type';

import { Pip } from './pip';

describe('Pip', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    project.tasks.addTask(CommonTargets.INSTALL);
    new Pip(project, { venvPath: '.venv' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
  test('snapshot with custom options', () => {
    const project = new TestProject();
    project.tasks.addTask(CommonTargets.INSTALL);
    new Pip(project, { venvPath: '.custom_venv' }, { lockFile: 'custom_requirements.txt' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });

  test('snapshot with another set of custom options', () => {
    const project = new TestProject();
    project.tasks.addTask(CommonTargets.INSTALL);
    new Pip(
      project,
      {
        venvPath: '.another_venv',
      },
      { lockFile: 'another_requirements.txt', lockFileDev: 'dev_requirements.txt' },
    );
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
});
