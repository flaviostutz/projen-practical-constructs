/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../test-project'; // or your local test project setup

import { PublishTasks, PublishOptions } from './publish-tasks';
import { PublishNpmOptions } from './publish-npm-tasks';
import { PublishPypiOptions } from './publish-pypi-tasks';

// lib/src/common/components/publish/publish-tasks.test.ts

describe('PublishTasks', () => {
  it('throws an error if neither npm nor pypi is defined', () => {
    const project = new TestProject();
    expect(() => new PublishTasks(project, { skipChecks: true })).toThrow(
      "At least one of 'npm' or 'pypi' options must be defined",
    );
  });

  it('throws an error if skipBump or skipChecks is false and no monotagOptions provided', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipBump: false,
      skipChecks: false,
      npm: { packagesDir: 'dist/js' } as PublishNpmOptions,
    };
    expect(() => new PublishTasks(project, opts)).toThrow(
      'monotagOptions must be defined if skipBump or skipChecks is false',
    );
  });

  it('creates a publish task with default name when group is not set', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    expect(out['.projen/tasks.json'].tasks.publish).toBeDefined();
  });

  it('creates a publish task with group name appended', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      group: 'custom',
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    expect(out['.projen/tasks.json'].tasks['publish-custom']).toBeDefined();
  });

  it('generates steps for npm tasks if npm is provided', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks.publish.steps.some((s: any) => s.spawn === 'publish-npm')).toBeTruthy();
  });

  it('generates steps for pypi tasks if pypi is provided', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      pypi: { packagesDir: 'dist/python' } as PublishPypiOptions,
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const { tasks } = out['.projen/tasks.json'];
    expect(tasks.publish.steps.some((s: any) => s.spawn === 'publish-python')).toBeTruthy();
  });

  it('appends fileVersionCheckPrePublishScript when skipChecks is false', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: false,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const { steps } = out['.projen/tasks.json'].tasks.publish;
    // The script is appended to the check-and-umbump step
    expect(steps.at(-2).exec).toContain('No file found in');
    expect(steps.at(-2).exec).toContain("with version '$TAG_VERSION' in the name");
  });
});
