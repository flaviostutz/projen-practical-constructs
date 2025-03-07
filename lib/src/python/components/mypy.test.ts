/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';
import { CommonTargets } from '../../common/components/common-target-type';

import { MyPy } from './mypy';

describe('MyPy', () => {
  describe('MyPy', () => {
    test('custom venvPath', () => {
      const project = new TestProject();
      project.addTask(CommonTargets.LINT);
      new MyPy(project, { venvPath: './custom_venv' });
      const out = Testing.synth(project);
      expect(out).toMatchSnapshot();
    });
  });
});
