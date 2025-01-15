/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../utils';

import { PyTest } from './pytest';

describe('PyTest', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    new PyTest(project, { venvPath: '.venv' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
  /* eslint-disable no-new */

  test('custom venvPath', () => {
    const project = new TestProject();
    new PyTest(project, { venvPath: 'custom_venv' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });

  test('with additional options', () => {
    const project = new TestProject();
    new PyTest(
      project,
      { venvPath: '.venv' },
      { minCoverage: 20, omitPatterns: ['*/tests-not/*'], format: 'total' },
    );
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
  test('tasks are added correctly', () => {
    const project = new TestProject();
    new PyTest(project, { venvPath: '.venv' });
    Testing.synth(project);
    expect(project.tasks.all.filter((t) => t.name === 'test-unit').length).toBe(1);
  });
});
