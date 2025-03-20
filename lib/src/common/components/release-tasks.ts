import { Component, Project } from 'projen';

import { expandMonotagCmd, NextTagOptions } from '../types/monotag';
import { WithRequired } from '../types/utils';
import { monotagCliArgs } from '../utils/monotag';

import { CommonTargets } from './common-target-type';

/**
 * Create tasks to support the basics of creating a software release based on git tags.
 * Uses monotag to calculate the next tag and release notes.
 *
 * Tasks:
 *   - release[:name]:current: Verifies if the current commit is already tagged with the latest calculated tag. If so, bumps files, saves version/tag/notes in output files/changelogs.
 *   - release[:name]: Will execute before -> next-tag -> generate -> [tag|push] -> after for this release group
 *   - release[:name]:before: executed before any other tasks in release. Placeholder for any pre-release related tasks
 *   - release[:name]:next-tag: Calculate the next version of the software, output tag and notes to console, write output files, bump files and append changelog. Supports complex release tagging in monorepos by using "npx monotag"
 *   - release[:name]:generate: executed after tag calculation and before git operations. Placeholder for custom tasks, such as doc generation, package build etc
 *   - release[:name]:git-tag: Tag the current commit with the calculated release tag on git repo (if action is 'tag')
 *   - release[:name]:git-push: Push the tagged commit to remote git (if action is 'push')
 *   - release[:name]:after: executed after all other tasks in release. Placeholder for any post-release related tasks
 */
export class ReleaseTasks extends Component {
  constructor(project: Project, opts?: ReleaseOptions) {
    super(project);

    const optsWithDefaults = getOptionsWithDefaults(opts);

    // add resources to gitignore
    if (optsWithDefaults.notesFile) {
      project.addGitIgnore(optsWithDefaults.notesFile);
    }
    if (optsWithDefaults.tagFile) {
      project.addGitIgnore(optsWithDefaults.tagFile);
    }
    if (optsWithDefaults.versionFile) {
      project.addGitIgnore(optsWithDefaults.versionFile);
    }

    const taskPrefix = `${CommonTargets.RELEASE}${optsWithDefaults.name ? `:${optsWithDefaults.name}` : ''}`;

    const releaseTask = project.addTask(`${taskPrefix}`, {
      description: `Release a new version by calculating next tag/version, generating changelogs, documentation, commiting, tagging and pushing these changes/tag to the repo.`,
    });

    const preTask = project.addTask(`${taskPrefix}:before`, {
      description: 'Executed before any release tasks. Placeholder for customizations',
    });
    releaseTask.spawn(preTask);

    const nextTagTask = project.addTask(`${taskPrefix}:next-tag`, {
      description:
        'Calculate next tag and version of the software and display on console. No git operations are performed, but depending on the configurations, changelog, version, tag an notes might be written to files. Supports complex release tagging in monorepos by using "npx monotag"',
      steps: [
        {
          exec: `${optsWithDefaults.monotagCmd} tag ${monotagCliArgs(optsWithDefaults)}`,
        },
      ],
    });
    releaseTask.spawn(nextTagTask);

    project.addTask(`${taskPrefix}:current`, {
      description:
        'Verifies if the current commit is already tagged with the latest calculated tag. If so, bumps files, saves version/tag/notes in output files/changelogs.',
      steps: [
        {
          exec: `${optsWithDefaults.monotagCmd} current ${monotagCliArgs(optsWithDefaults)}`,
        },
      ],
    });

    const generateTask = project.addTask(`${taskPrefix}:generate`, {
      description: 'Generates documentation, special files etc. Placeholder for customizations',
    });
    releaseTask.spawn(generateTask);

    if (optsWithDefaults.action === 'tag') {
      const gitTagTask = project.addTask('git-tag', {
        description: 'Commit all files and git tag with calculated release tag',
        steps: [
          {
            exec: `${optsWithDefaults.monotagCmd} tag-git ${monotagCliArgs(optsWithDefaults)}`,
          },
        ],
      });
      releaseTask.spawn(gitTagTask);
    }

    if (optsWithDefaults.action === 'push') {
      const gitPushTask = project.addTask(`${taskPrefix}:git-push`, {
        description:
          'Commit all files, git tag with calculated release tag and push it to remote git',
        steps: [
          {
            exec: `${optsWithDefaults.monotagCmd} tag-push ${monotagCliArgs(optsWithDefaults)}`,
          },
        ],
      });
      releaseTask.spawn(gitPushTask);
    }

    const postTask = project.addTask(`${taskPrefix}:after`, {
      description: 'Executed after all release tasks. Placeholder for customizations',
    });
    releaseTask.spawn(postTask);
  }
}

const getOptionsWithDefaults = (
  opts?: ReleaseOptions,
): WithRequired<ReleaseOptions, 'name' | 'action' | 'monotagCmd'> => {
  // check if action is valid
  if (opts?.action && !['console', 'tag', 'push'].includes(opts.action)) {
    throw new Error(
      `Invalid action: '${opts?.action}'. Valid actions are: 'console', 'tag', 'push'`,
    );
  }

  if (
    (opts?.action === 'push' || opts?.action === 'tag') &&
    (!opts?.gitEmail || !opts?.gitUsername)
  ) {
    throw new Error('gitEmail and gitUsername are required when action is "tag" or "push"');
  }

  return {
    name: '',
    action: 'console',
    monotagCmd: expandMonotagCmd(opts?.monotagCmd),
    ...opts,
  };
};

export interface ReleaseOptions extends NextTagOptions {
  /**
   * Action to be taken after calculating the next tag
   * Options:
   *  - console: Print calculated tag/notes to console
   *  - tag: Calculate tag/notes, commit and tag (git) resources
   *  - push: Calculate tag/notes, commit, tag (git) and push resources to remote git
   * @default 'console'
   */
  readonly action?: 'console' | 'tag' | 'push';
  /**
   * Name of this release group of tasks
   * Useful if you have multiple release tasks in the same project
   * with different configurations.
   * The release tasks will be named as "release:[name]:[task]"
   * @default ''
   */
  readonly name?: string;
}
