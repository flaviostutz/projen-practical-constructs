/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../test-project';

import { PublishNpmTasks, PublishNpmOptions } from './publish-npm-tasks';

describe('PublishNpmTasks', () => {
  it('throws error if registryUrl is missing', () => {
    const project = new TestProject();
    expect(() => new PublishNpmTasks(project, { packagesDir: '' } as PublishNpmOptions)).toThrow(
      'packagesDir is required',
    );
  });

  it('creates task with default name', () => {
    const project = new TestProject();
    new PublishNpmTasks(project, {
      registryUrl: 'https://registry.npmjs.org',
      packagesDir: 'dist/js',
    });
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks['publish-npm']).toBeDefined();
  });

  it('creates task with group name', () => {
    const project = new TestProject();
    new PublishNpmTasks(project, {
      registryUrl: 'https://registry.npmjs.org',
      packagesDir: 'dist/js',
      group: 'custom-group',
    });
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks['publish-npm-custom-group']).toBeDefined();
  });

  it('task steps match expected commands', () => {
    const project = new TestProject();
    new PublishNpmTasks(project, {
      registryUrl: 'https://registry.npmjs.org',
      packagesDir: 'dist/js',
    });
    const out = Testing.synth(project);
    const { steps } = out['.projen/tasks.json'].tasks['publish-npm'];
    expect(steps[0].exec).toContain('NPM_TOKEN');
    expect(steps[1].exec).toContain('No packages found');
    expect(steps[2].exec).toContain('publib-npm');
    expect(steps[2].exec).toContain('dist/js');
  });

  it('resolves NPM_REGISTRY environment variable', () => {
    const project = new TestProject();
    new PublishNpmTasks(project, {
      registryUrl: 'https://custom.registry',
      packagesDir: 'dist/js',
    });
    const out = Testing.synth(project);
    const { env } = out['.projen/tasks.json'].tasks['publish-npm'].steps[2];
    expect(env.NPM_REGISTRY).toBe('https://custom.registry');
  });
});
