/* eslint-disable no-new */
import { Testing, Project } from 'projen';

import { CommonTargetsTasks } from './common-targets';

describe('CommonTargetsTasks', () => {
  it('minimum tasks', () => {
    const project = new Project({ name: 'test1' });
    new CommonTargetsTasks(project, { lint: true });
    const synth = Testing.synth(project);
    const tasksObj = synth['.projen/tasks.json'];
    expect(tasksObj).not.toMatchObject({
      tasks: { build: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { test: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { package: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { compile: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { 'pre-compile': {} },
    });
    expect(tasksObj).toMatchObject({
      tasks: {
        lint: { description: 'Lint project (code style, formatting, audit, code smells etc)' },
      },
    });
  });

  it('adds build tasks when build is true', () => {
    const project = new Project({ name: 'test1' });
    new CommonTargetsTasks(project, { build: true });
    const synth = Testing.synth(project);
    const tasksObj = synth['.projen/tasks.json'];
    expect(tasksObj).toMatchObject({
      tasks: { build: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { 'compile:pre': {} },
    });
  });
  it('adds lint and test tasks when lint/test are enabled', () => {
    const project = new Project({ name: 'test' });
    new CommonTargetsTasks(project, {
      build: true,
      lint: true,
      test: true,
      deploy: true,
      release: true,
      publish: false,
    });
    const synth = Testing.synth(project);
    const tasksObj = synth['.projen/tasks.json'];
    expect(tasksObj).toMatchObject({
      tasks: { build: {} },
    });
    expect(tasksObj).toMatchObject({
      tasks: { lint: {} },
    });
    expect(tasksObj).toMatchObject({
      tasks: { test: {} },
    });
    expect(tasksObj).toMatchObject({
      tasks: { deploy: {} },
    });
    expect(tasksObj).toMatchObject({
      tasks: { release: {} },
    });
    expect(tasksObj).not.toMatchObject({
      tasks: { publish: {} },
    });
  });
});
