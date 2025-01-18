/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { MyPy } from './mypy';

describe('MyPy', () => {
  describe('MyPy', () => {
    test('snapshot of default options', () => {
      const project = new TestProject();
      new MyPy(project, { venvPath: '.venv' });
      const out = Testing.synth(project);
      expect(out).toMatchSnapshot();
    });

    test('custom venvPath', () => {
      const project = new TestProject();
      new MyPy(project, { venvPath: './custom_venv' });
      const out = Testing.synth(project);
      expect(out).toMatchSnapshot();
    });

    test('attachTasksTo option', () => {
      const project = new TestProject();
      project.addTask('build1', {
        exec: 'echo "Building project..."',
      });
      new MyPy(project, { venvPath: '.venv', attachTasksTo: 'build1' });
      const out = Testing.synth(project);
      expect(out).toMatchSnapshot();
    });

    test('without attachTasksTo option', () => {
      const project = new TestProject();
      new MyPy(project, { venvPath: '.venv' });
      const out = Testing.synth(project);
      expect(out).toMatchSnapshot();
    });
  });
});
