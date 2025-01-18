/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { Ruff } from './ruff';

describe('Ruff', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    new Ruff(project, { venvPath: '.venv' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
  /* eslint-disable no-new */

  test('snapshot with custom options', () => {
    const project = new TestProject();
    new Ruff(project, { venvPath: '.venv' }, { attachFixTaskTo: 'pre-commit' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });

  test('adds ruff dependency', () => {
    const project = new TestProject();
    new Ruff(project, { venvPath: '.venv' });
    Testing.synth(project);
    expect(project.deps.all.filter((d) => d.name === 'ruff').length).toBe(1);
  });

  test('adds ruff tasks', () => {
    const project = new TestProject();
    new Ruff(project, { venvPath: '.venv' });
    Testing.synth(project);
    expect(project.tasks.all.filter((t) => t.name === 'lint-ruff').length).toBe(1);
    expect(project.tasks.all.filter((t) => t.name === 'lint-ruff-fix').length).toBe(1);
  });
});
