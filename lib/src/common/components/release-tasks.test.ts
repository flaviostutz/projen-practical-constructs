/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../test-project';
import { MONOTAG_VERSION } from '../constants';

import { ReleaseTasks, ReleaseOptions } from './release-tasks';

describe('ReleaseTasks', () => {
  it('synthesizes correctly with default options', () => {
    const project = new TestProject();
    new ReleaseTasks(project);
    const output = Testing.synth(project);
    // eslint-disable-next-line unicorn/no-null
    expect(output).toMatchSnapshot();
  });

  it('synthesizes correctly with custom options', () => {
    const project = new TestProject();
    const options: ReleaseOptions = {
      action: 'push',
      name: 'custom',
      gitEmail: 'test@example.com',
      gitUsername: 'testuser',
    };
    new ReleaseTasks(project, options);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });

  it('adds options to monotag calls', () => {
    const project = new TestProject();
    const options: ReleaseOptions = {
      action: 'push',
      name: 'custom',
      gitEmail: 'test@example.com',
      gitUsername: 'testuser',
      bumpAction: 'latest',
      preRelease: true,
    };
    new ReleaseTasks(project, options);
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'];
    expect(tasksObj).toMatchObject({
      tasks: {
        'release:custom:next-tag': {
          steps: [
            {
              exec: `npx -y monotag@${
                MONOTAG_VERSION
              } tag --bump-action="latest" --git-email="test@example.com" --git-username="testuser" --prerelease="true"`,
            },
          ],
        },
      },
    });
  });

  it('throws error for invalid action', () => {
    const project = new TestProject();
    const options: ReleaseOptions = {
      action: 'invalid' as 'console',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      "Invalid action: 'invalid'. Valid actions are: 'console', 'tag', 'push'",
    );
  });

  it('throws error when gitEmail and gitUsername are missing for tag action', () => {
    const project = new TestProject();
    const options: ReleaseOptions = {
      action: 'tag',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      'gitEmail and gitUsername are required when action is "tag" or "push"',
    );
  });

  it('throws error when gitEmail and gitUsername are missing for push action', () => {
    const project = new TestProject();
    const options: ReleaseOptions = {
      action: 'push',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      'gitEmail and gitUsername are required when action is "tag" or "push"',
    );
  });
});
describe('ReleaseTasks constructor', () => {
  it('creates default tasks if no name is provided', () => {
    const project = new TestProject();
    new ReleaseTasks(project);
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'].tasks;
    expect(tasksObj).toHaveProperty('release');
    expect(tasksObj).toHaveProperty('release:before');
    expect(tasksObj).toHaveProperty('release:next-tag');
    expect(tasksObj).toHaveProperty('release:generate');
    expect(tasksObj).toHaveProperty('release:after');
    expect(tasksObj).not.toHaveProperty('release::git-push');
    expect(tasksObj).not.toHaveProperty('git-tag');
  });

  it('creates tasks with a custom name', () => {
    const project = new TestProject();
    new ReleaseTasks(project, { name: 'my-release' });
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'].tasks;
    expect(tasksObj).toHaveProperty('release:my-release');
    expect(tasksObj).toHaveProperty('release:my-release:before');
    expect(tasksObj).toHaveProperty('release:my-release:next-tag');
    expect(tasksObj).toHaveProperty('release:my-release:generate');
    expect(tasksObj).toHaveProperty('release:my-release:after');
  });

  it('uses default monotag command when monotagCmd is not provided', () => {
    const project = new TestProject();
    new ReleaseTasks(project);
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'].tasks['release:next-tag'];
    const execCmd = tasksObj.steps[0].exec;
    expect(execCmd).toContain('npx -y monotag@');
  });
});
describe('gitTagTask', () => {
  it('creates a "git-tag" task if action is "tag"', () => {
    const project = new TestProject();
    new ReleaseTasks(project, {
      action: 'tag',
      gitEmail: 'email@example.com',
      gitUsername: 'user',
    });
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'].tasks;
    expect(tasksObj).toHaveProperty('git-tag');
    expect(tasksObj['git-tag'].steps[0].exec).toMatch(/tag-git/);
  });

  it('does not create a "git-tag" task if action is "console"', () => {
    const project = new TestProject();
    new ReleaseTasks(project, {
      action: 'console',
    });
    const output = Testing.synth(project);
    const tasksObj = output['.projen/tasks.json'].tasks;
    expect(tasksObj).not.toHaveProperty('git-tag');
  });
});
