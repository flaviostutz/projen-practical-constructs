import { Component, Project } from 'projen';

import { NextTagOptions } from '../types/monotag';
import { WithRequired } from '../types/utils';
import { monotagCliArgs } from '../utils/monotag';

/**
 * Create tasks to support the basics of creating a software release based on git tags.
 * Uses monotag to calculate the next tag and release notes.
 *
 * Tasks:
 *   - release[:name]: Will execute pre -> next-tag -> generate -> [tag|push] -> post for this release group
 *   - release[:name]:pre: executed before any other tasks in release. Placeholder for any pre-release related tasks
 *   - release[:name]:next-tag: Calculate the next version of the software and output tag and notes to console. Supports complex release tagging in monorepos by using "npx monotag"
 *   - release[:name]:generate: executed after tag calculation and before git operations. Placeholder for custom tasks, such as doc generation, package build etc
 *   - release[:name]:git-tag: Tag the current commit with the calculated release tag on git repo (if action is 'tag')
 *   - release[:name]:git-push: Push the tagged commit to remote git (if action is 'push')
 *   - release[:name]:post: executed after all other tasks in release. Placeholder for any post-release related tasks
 */
export class ReleaseTasks extends Component {
  constructor(project: Project, opts?: ReleaseTasksOptions) {
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

    const taskPrefix = `release${optsWithDefaults.name ? `:${optsWithDefaults.name}` : ''}`;

    const releaseTask = project.addTask(`${taskPrefix}`, {
      description: `Release a new version by calculating next tag/version, generating changelogs, documentation, commiting, tagging and pushing these changes/tag to the repo.`,
    });

    const preTask = project.addTask(`${taskPrefix}:pre`, {
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

    const postTask = project.addTask(`${taskPrefix}:post`, {
      description: 'Executed after all release tasks. Placeholder for customizations',
    });
    releaseTask.spawn(postTask);
  }
}

const getOptionsWithDefaults = (
  opts?: ReleaseTasksOptions,
): WithRequired<ReleaseTasksOptions, 'name' | 'action' | 'monotagCmd'> => {
  // check if action is valid
  if (opts?.action && !['console', 'tag', 'push'].includes(opts.action)) {
    throw new Error(`Invalid action: ${opts.action}. Valid actions are: console, tag, push`);
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
    monotagCmd: 'npx -y monotag@1.14.0',
    ...opts,
  };
};

export interface ReleaseTasksOptions extends NextTagOptions {
  /**
   * Action to be taken after calculating the next tag/notes
   * Options:
   *  - console: Print calculated tag/notes to console
   *  - tag: Calculate tag/notes, commit and tag (git) resources
   *  - push: Calculate tag/notes, commit, tag (git) and push resources to remote git
   * @default 'console'
   */
  action: 'console' | 'tag' | 'push';
  /**
   * Name of this release group of tasks
   * Useful if you have multiple release tasks in the same project
   * with different configurations.
   * The release tasks will be named as "release:<name>:<task>"
   * @default ''
   */
  name?: string;
}
