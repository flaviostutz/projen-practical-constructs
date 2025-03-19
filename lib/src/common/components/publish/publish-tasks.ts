/* eslint-disable functional/immutable-data */
/* eslint-disable no-new */
import { Component, Project, TaskStep } from 'projen';

import { NextTagOptions } from '../../types';
import { monotagCliArgs } from '../../utils/monotag';

import { PublishPypiOptions, PublishPypiTasks } from './publish-pypi-tasks';
import { PublishNpmOptions, PublishNpmTasks } from './publish-npm-tasks';

/**
 * Defines a set of tasks to publish packages to npm and/or pypi registries.
 */
export class PublishTasks extends Component {
  constructor(project: Project, opts: PublishOptions) {
    super(project);

    if (!opts.npm && !opts.pypi) {
      throw new Error("At least one of 'npm' or 'pypi' options must be defined");
    }

    if ((!opts.skipBump || !opts.skipChecks) && !opts.monotagOptions) {
      throw new Error('monotagOptions must be defined if skipBump or skipChecks is false');
    }

    const taskName = `publish${opts.group ? `-${opts.group}` : ''}`;
    project.removeTask(taskName);
    project.addTask(`${taskName}:before`, {
      description: 'Executed before all publish tasks. Placeholder for customizations',
    });

    const publishSteps: TaskStep[] = [];
    // eslint-disable-next-line functional/no-let
    let fileVersionCheckPrePublishScript = '';

    // add npm publish tasks
    if (opts.npm) {
      const npmWithDef = npmWithDefaults(opts.npm);
      const nt = new PublishNpmTasks(project, npmWithDef);
      const checkScript = checkTaskAndFilesScript(
        project,
        nt.taskName,
        opts,
        npmWithDef.packagesDir,
      );
      fileVersionCheckPrePublishScript += checkScript;
      publishSteps.push({ spawn: nt.taskName });
    }

    // add pypi publish tasks
    if (opts.pypi) {
      const pypiWithDef = pypiWithDefaults(opts.pypi);
      const nt = new PublishPypiTasks(project, pypiWithDef);
      const checkScript = checkTaskAndFilesScript(
        project,
        nt.taskName,
        opts,
        pypiWithDef.packagesDir,
      );
      fileVersionCheckPrePublishScript += checkScript;
      publishSteps.push({ spawn: nt.taskName });
    }

    const preSteps = prePublishSteps(taskName, opts, fileVersionCheckPrePublishScript);

    project.addTask(taskName, {
      description: 'Publish packages to npm and/or pypi registries',
      steps: [...preSteps, ...publishSteps],
    });
  }
}

export const npmWithDefaults = (opts: PublishNpmOptions): PublishNpmOptions => {
  return {
    ...opts,
    packagesDir: opts.packagesDir ?? 'dist/js',
  };
};

export const pypiWithDefaults = (opts: PublishPypiOptions): PublishPypiOptions => {
  return {
    ...opts,
    registryUrl: opts.registryUrl ?? 'https://upload.pypi.org/legacy/',
    packagesDir: opts.packagesDir ?? 'dist/python',
  };
};

export const checkTaskAndFilesScript = (
  project: Project,
  taskName: string,
  opts: PublishOptions,
  packagesDir: string,
): string => {
  const task = project.tasks.tryFind(taskName);
  if (!task) {
    throw new Error(`task '${taskName}' not found`);
  }
  if (!opts.skipChecks) {
    return `\n[ ls -A ${packagesDir} | grep $TAG_VERSION ] || { echo "No file found in '${packagesDir}' with version '$TAG_VERSION' in the name"; return 1; }`;
  }
  return '';
};

export const prePublishSteps = (
  taskName: string,
  opts: PublishOptions,
  fileVersionChecksScript: string,
): TaskStep[] => {
  // define steps
  const steps: TaskStep[] = [];

  // invoke pre-publish tasks, such as "release", "lint", "test"
  steps.push({ spawn: `${taskName}:before` });

  // invoke monotag to bump and/or check git status/tags
  if (!opts.skipBump || !opts.skipChecks) {
    const preMonotagAction = opts.skipChecks ? 'tag' : 'current';
    const preMonotagOptions: NextTagOptions = {
      ...opts.monotagOptions,
      // only force bump if build task is defined and skipBump is false, otherwise use the configuration provided
      bumpAction: opts.buildTask && !opts.skipBump ? 'latest' : opts.monotagOptions?.bumpAction,
    };
    steps.push({
      name: 'check-and-bump',
      exec: `${opts.monotagOptions?.monotagCmd} ${preMonotagAction} ${monotagCliArgs(preMonotagOptions)}`,
    });
  }

  // invoke build task after bumping and/or checking
  if (opts.buildTask) {
    steps.push({ name: 'build', spawn: opts.buildTask });
  }

  // unbump package descriptors, set TAG_VERSION env to the latest tag and check if package files have version in their names
  const afterBuildMonotagOptions: NextTagOptions = {
    ...opts.monotagOptions,
    // only umbump if build task is defined and skipBump is false, otherwise do nothing
    bumpAction: opts.buildTask && !opts.skipBump ? 'zero' : 'none',
  };
  // this is done in one command so we can get the monotag output tag version at the same time that (possibly) it umbumps the package descriptors
  steps.push({
    name: 'check-and-umbump',
    exec: `TAG_VERSION=${opts.monotagOptions?.monotagCmd} tag ${monotagCliArgs(afterBuildMonotagOptions)} | head -2 | tail -1; \\${fileVersionChecksScript}`,
  });

  return steps;
};

export interface PublishOptions {
  /**
   * The name of the task that will be invoked to generate package files to be published.
   */
  buildTask?: string;
  /**
   * If true, won't bump the version field of package.json, pyproject.toml etc to the latest tag found before invoking the build task.
   * @default false
   */
  skipBump?: boolean;
  /**
   * Disable checks before publishing.
   * By default the following checks are performed:
   * - The git working directory is clean (no uncommited changes)
   * - The current commit is tagged with the latest version calculated for the package
   * - The latest version tagged in git is equal to the version in the package file name being published
   * This is useful to avoid publishing packages whose contents are not actually commited/tagged in git.
   * In order to perform some of the checks, monotag will be invoked with action "current". If not, "tag" will be used.
   * @default false
   */
  skipChecks: boolean;
  /**
   * Options for next tag calculation. Used as the base options for monotag invocations during bumping and tagging checks
   */
  monotagOptions?: NextTagOptions;
  /**
   * Options for npm publishing.
   */
  npm?: PublishNpmOptions;
  /**
   * Options for pypi publishing.
   */
  pypi?: PublishPypiOptions;
  /**
   * If defined, will suffix the task name by this name so that multiple
   * publish tasks with different configurations can be defined in the same project.
   */
  group?: string;
}
