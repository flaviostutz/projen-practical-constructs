/* eslint-disable no-new */
import { Testing, Project } from 'projen';

import { CommonTargetsTasks, BaseTasksOptions } from './common-targets';

describe('CommonTargetsTasks', () => {
  it('does not add tasks when no options are provided', () => {
    const project = new Project({ name: 'test1' });
    new CommonTargetsTasks(project, { lint: true });
    const synth = Testing.synth(project);
    console.log(JSON.stringify(synth, null, 2));
    expect(synth['.projen/tasks.json']).not.toMatchObject({
      tasks: { build: {} },
    });
    expect(synth['.projen/tasks.json']).toMatchObject({
      tasks: { lint: { description: 'Lint project' } },
    });
  });

  it('adds build tasks when build is true', () => {
    const project = new Project({ name: 'test1' });
    new CommonTargetsTasks(project, { build: true });
    const synth = Testing.synth(project);
    expect(synth['.projen/tasks.json']).toContain('"name":"build"');
    expect(synth['.projen/tasks.json']).toContain('"name":"install"');
    expect(synth['.projen/tasks.json']).toContain('"name":"compile"');
    expect(synth['.projen/tasks.json']).toContain('"name":"package"');
  });

  it('adds lint and test tasks when lint/test are enabled', () => {
    const project = new Project({ name: 'test' });
    new CommonTargetsTasks(project, { build: true, lint: true, test: true });
    const synth = Testing.synth(project);
    expect(synth['.projen/tasks.json']).toContain('"name":"lint"');
    expect(synth['.projen/tasks.json']).toContain('"name":"test"');
  });

  it('adds lifecycle tasks when buildLifecycleTasks is enabled', () => {
    const project = new Project({ name: 'test' });
    new CommonTargetsTasks(project, { build: true, buildLifecycleTasks: true });
    const synth = Testing.synth(project);
    expect(synth['.projen/tasks.json']).toContain('"name":"compile:pre"');
    expect(synth['.projen/tasks.json']).toContain('"name":"package:pre"');
  });

  it('adds release tasks when release is true', () => {
    const project = new Project({ name: 'test' });
    const opts: BaseTasksOptions = {
      build: true,
      release: true,
      releaseOpts: { action: 'console' },
    };
    new CommonTargetsTasks(project, opts);
    const synth = Testing.synth(project);
    expect(synth['.projen/tasks.json']).toContain('"action":"console"');
  });
});
