/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../test-project';

import { ReleaseTasks, ReleaseTasksOptions } from './release-tasks';

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
    const options: ReleaseTasksOptions = {
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
    const options: ReleaseTasksOptions = {
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
              exec: 'npx -y monotag@1.14.0 tag --bump-action="latest" --git-email="test@example.com" --git-username="testuser" --prerelease="true"',
            },
          ],
        },
      },
    });
  });

  it('throws error for invalid action', () => {
    const project = new TestProject();
    const options: ReleaseTasksOptions = {
      action: 'invalid' as 'console',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      'Invalid action: invalid. Valid actions are: console, tag, push',
    );
  });

  it('throws error when gitEmail and gitUsername are missing for tag action', () => {
    const project = new TestProject();
    const options: ReleaseTasksOptions = {
      action: 'tag',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      'gitEmail and gitUsername are required when action is "tag" or "push"',
    );
  });

  it('throws error when gitEmail and gitUsername are missing for push action', () => {
    const project = new TestProject();
    const options: ReleaseTasksOptions = {
      action: 'push',
    };
    expect(() => new ReleaseTasks(project, options)).toThrow(
      'gitEmail and gitUsername are required when action is "tag" or "push"',
    );
  });
});
