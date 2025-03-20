/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../test-project'; // or your local test project setup
import { MONOTAG_VERSION } from '../../constants';

import { PublishTasks, PublishOptions } from './publish-tasks';
import { PublishPypiOptions } from './publish-pypi-tasks';

describe('PublishTasks', () => {
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

  it('generate correct options in monotag calls when monotagOptions is not provided', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    expect(out['.projen/tasks.json'].tasks.publish).toBeDefined();
    const { steps } = out['.projen/tasks.json'].tasks.publish;
    const cmd = steps.find((s: any) => s.name === 'check-and-unbump').exec;
    expect(cmd).toContain('tag');
    expect(cmd).toContain(`TAG_VERSION=$(npx -y monotag@${MONOTAG_VERSION}`);
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
    // The script is appended to the check-and-unbump step
    expect(steps.at(-3).exec).toContain('No file found in');
    expect(steps.at(-3).exec).toContain("with version '$TAG_VERSION' in the name");
  });

  it('uses "build" as default build task if none is specified and a "build" task exists', () => {
    const project = new TestProject();
    // project comes with "build" task by default
    // project.addTask('build');
    const opts: PublishOptions = {
      skipBump: true,
      skipChecks: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const publishSteps = out['.projen/tasks.json'].tasks.publish.steps;
    expect(publishSteps.some((s: any) => s.name === 'build')).toBeTruthy();
    expect(publishSteps.find((s: any) => s.name === 'build').spawn).toBe('build');
  });

  it('does not add build step if no "build" task is found and buildTask is not provided', () => {
    const project = new TestProject();
    project.removeTask('build');
    const opts: PublishOptions = {
      skipChecks: true,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const publishSteps = out['.projen/tasks.json'].tasks.publish.steps;
    expect(publishSteps.some((s: any) => s.name === 'build')).toBeFalsy();
  });

  it('throws an error if the specified buildTask is not found in the project', () => {
    const project = new TestProject();
    const opts: PublishOptions = {
      buildTask: 'my-build',
      skipChecks: true,
      skipBump: true,
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    expect(() => new PublishTasks(project, opts)).toThrow("build task 'my-build' not found");
  });

  it('uses bumpAction=zero when skipBump is false and buildTask is defined', () => {
    const project = new TestProject();
    // project comes with "build" task by default
    // project.addTask('build');
    const opts: PublishOptions = {
      skipBump: false,
      skipChecks: true,
      buildTask: 'build',
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const { steps } = out['.projen/tasks.json'].tasks.publish;
    const cmd = steps.find((s: any) => s.name === 'check-and-unbump').exec;
    expect(cmd).toContain('tag');
    expect(cmd).toContain('--bump-action="zero"');
  });

  it('uses bumpAction=none when skipBump is true', () => {
    const project = new TestProject();
    // project comes with "build" task by default
    // project.addTask('build');
    const opts: PublishOptions = {
      skipBump: true,
      skipChecks: true,
      buildTask: 'build',
      monotagOptions: { monotagCmd: 'dummy' },
      npm: { packagesDir: 'dist/js' },
    };
    new PublishTasks(project, opts);
    const out = Testing.synth(project);
    const { steps } = out['.projen/tasks.json'].tasks.publish;
    const cmd = steps.find((s: any) => s.name === 'check-and-unbump').exec;
    expect(cmd).toContain('tag');
    expect(cmd).toContain('--bump-action="none"');
  });
});
