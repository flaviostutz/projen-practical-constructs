/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../test-project';

import { PublishPypiTasks, PublishPypiOptions } from './publish-pypi-tasks';

// lib/src/common/components/publish/publish-pypi-tasks.test.ts

describe('PublishPypiTasks', () => {
  it('throws error if registryUrl is missing', () => {
    const project = new TestProject();
    expect(() => new PublishPypiTasks(project, { packagesDir: '' } as PublishPypiOptions)).toThrow(
      'packagesDir is required',
    );
  });

  it('creates default task name', () => {
    const project = new TestProject();
    new PublishPypiTasks(project, {
      registryUrl: 'https://pypi.org',
      packagesDir: 'dist/python',
    });
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks['publish-python']).toBeDefined();
  });

  it('creates task name with group', () => {
    const project = new TestProject();
    new PublishPypiTasks(project, {
      registryUrl: 'https://pypi.org',
      packagesDir: 'dist/python',
      group: 'custom',
    });
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks['publish-python-custom']).toBeDefined();
  });

  it('task steps include check credentials, check package, and publish package', () => {
    const project = new TestProject();
    new PublishPypiTasks(project, {
      registryUrl: 'https://test.pypi.org',
      packagesDir: 'dist/python',
    });
    const out = Testing.synth(project);
    const { steps } = out['.projen/tasks.json'].tasks['publish-python'];
    expect(steps[0].exec).toContain('TWINE_USERNAME');
    expect(steps[1].exec).toContain('No packages found');
    expect(steps[2].exec).toContain('publib-pypi');
    expect(steps[2].exec).toContain('dist/python');
  });

  it('environment variable TWINE_REPOSITORY_URL is derived from registryUrl if not set', () => {
    const project = new TestProject();
    new PublishPypiTasks(project, {
      registryUrl: 'https://custom.registry',
      packagesDir: 'dist/python',
    });
    const out = Testing.synth(project);
    const { env } = out['.projen/tasks.json'].tasks['publish-python'].steps[2];
    expect(env.TWINE_REPOSITORY_URL).toBe('https://custom.registry');
  });
});
