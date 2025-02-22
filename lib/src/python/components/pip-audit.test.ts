/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { PipAudit } from './pip-audit';

describe('PipAudit', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    project.tasks.addTask('lint');
    project.tasks.addTask('lint-fix');
    new PipAudit(project, { venvPath: '.venv' });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
    expect(project.deps.all.filter((d) => d.name === 'pip-audit').length).toBe(1);
  });
});
