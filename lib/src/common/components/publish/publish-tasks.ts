/* eslint-disable functional/immutable-data */
/* eslint-disable no-new */
import { Component, Project, TaskStep } from 'projen';

import { expandMonotagCmd, NextTagOptions } from '../../types';
import { monotagCliArgs } from '../../utils/monotag';

import { PublishPypiOptions, PublishPypiTasks } from './publish-pypi-tasks';
import { PublishNpmOptions, PublishNpmTasks } from './publish-npm-tasks';

/**
 * Defines a set of tasks to publish packages to npm and/or pypi registries.
 */
export class PublishTasks extends Component {
  constructor(project: Project, opts?: PublishOptions) {
    super(project);

    const optsDef = expandOpts(opts);

    if (!optsDef.npm && !optsDef.pypi) {
      throw new Error("At least one of 'npm' or 'pypi' options must be defined");
    }

    if ((!optsDef.skipBump || !optsDef.skipChecks) && !optsDef.monotagOptions) {
      throw new Error('monotagOptions must be defined if skipBump or skipChecks is false');
    }

    const taskName = `publish${optsDef.group ? `-${optsDef.group}` : ''}`;
    project.removeTask(taskName);
    project.addTask(`${taskName}:before`, {
      description: 'Executed before all publish tasks. Placeholder for customizations',
    });
    project.addTask(`${taskName}:after`, {
      description: 'Executed after all publish tasks. Placeholder for customizations',
    });

    const publishSteps: TaskStep[] = [];
    // eslint-disable-next-line functional/no-let
    let fileVersionCheckPrePublishScript = '';

    // add npm publish tasks
    if (optsDef.npm) {
      const npmWithDef = npmWithDefaults(optsDef.npm);
      const nt = new PublishNpmTasks(project, npmWithDef);
      const checkScript = checkTaskAndFilesScript(
        project,
        nt.taskName,
        optsDef,
        npmWithDef.packagesDir,
      );
      fileVersionCheckPrePublishScript += checkScript;
      publishSteps.push({ spawn: nt.taskName });
    }

    // add pypi publish tasks
    if (optsDef.pypi) {
      const pypiWithDef = pypiWithDefaults(optsDef.pypi);
      const nt = new PublishPypiTasks(project, pypiWithDef);
      const checkScript = checkTaskAndFilesScript(
        project,
        nt.taskName,
        optsDef,
        pypiWithDef.packagesDir,
      );
      fileVersionCheckPrePublishScript += checkScript;
      publishSteps.push({ spawn: nt.taskName });
    }

    const preSteps = prePublishSteps(taskName, optsDef, fileVersionCheckPrePublishScript, project);

    // invoke post-publish tasks. e.g: "notify slack", "send email", "close tickets"
    const postSteps: TaskStep[] = [{ spawn: `${taskName}:after` }];

    project.addTask(taskName, {
      description: 'Publish packages to npm and/or pypi registries',
      steps: [...preSteps, ...publishSteps, ...postSteps],
    });
  }
}

export const expandOpts = (opts?: PublishOptions): PublishOptions => {
  return {
    npm: {
      packagesDir: 'dist/js',
      ...opts?.npm,
    },
    monotagOptions: {},
    ...opts,
  };
};

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
  project: Project,
): TaskStep[] => {
  // define steps
  const steps: TaskStep[] = [];

  // invoke pre-publish tasks. e.g: "release", "lint", "test"
  steps.push({ spawn: `${taskName}:before` });

  // invoke monotag to bump and/or check git status/tags
  if (!opts.skipBump || !opts.skipChecks) {
    const preMonotagAction = opts.skipChecks ? 'tag' : 'current';
    const preMonotagOptions: NextTagOptions = {
      ...opts.monotagOptions,
      // only force bump if build task is defined and skipBump is false, otherwise use the configuration provided
      bumpAction: opts.buildTask && !opts.skipBump ? 'latest' : opts.monotagOptions?.bumpAction,
    };
    const monotagCmd = expandMonotagCmd(opts.monotagOptions?.monotagCmd);
    steps.push({
      name: 'check-and-bump',
      exec: `${monotagCmd} ${preMonotagAction} ${monotagCliArgs(preMonotagOptions)}`,
    });
  }

  // invoke build task after bumping and/or checking
  // if build task not defined, try to use "build" as default
  // eslint-disable-next-line functional/no-let
  const { buildTask, monotagOptions, skipBump } = opts;
  // eslint-disable-next-line functional/no-let
  let buildTaskSpawn = buildTask;
  // eslint-disable-next-line no-undefined
  if (buildTaskSpawn === undefined) {
    // defaults to "build" task if exists
    buildTaskSpawn = project.tasks.tryFind('build') ? 'build' : '';
  }
  if (buildTaskSpawn) {
    if (!project.tasks.tryFind(buildTaskSpawn)) {
      throw new Error(`build task '${buildTaskSpawn}' not found`);
    }
    steps.push({ name: 'build', spawn: buildTaskSpawn });
  }

  // unbump package descriptors, set TAG_VERSION env to the latest tag and check if package files have version in their names
  const afterBuildMonotagOptions: NextTagOptions = {
    ...monotagOptions,
    // only unbump if build task is defined and skipBump is false, otherwise do nothing
    bumpAction: buildTask && !skipBump ? 'zero' : 'none',
  };
  // this is done in one command so we can get the monotag output tag version at the same time that (possibly) it unbumps the package descriptors
  const monotagCmd = expandMonotagCmd(monotagOptions?.monotagCmd);
  steps.push({
    name: 'check-and-unbump',
    exec: `TAG_VERSION=$(${monotagCmd} tag ${monotagCliArgs(afterBuildMonotagOptions)} | head -2 | tail -1); \\${fileVersionChecksScript}`,
  });

  return steps;
};

export interface PublishOptions {
  /**
   * The name of the task that will be invoked to generate package files to be published.
   * @default 'build', if exists in project. If not, no build task will be invoked.
   */
  readonly buildTask?: string;
  /**
   * If true, won't bump the version field of package.json, pyproject.toml etc to the latest tag found before invoking the build task.
   * @default false
   */
  readonly skipBump?: boolean;
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
  readonly skipChecks?: boolean;
  /**
   * Options for next tag calculation. Used as the base options for monotag invocations during bumping and tagging checks
   */
  readonly monotagOptions?: NextTagOptions;
  /**
   * Options for npm publishing.
   */
  readonly npm?: PublishNpmOptions;
  /**
   * Options for pypi publishing.
   */
  readonly pypi?: PublishPypiOptions;
  /**
   * If defined, will suffix the task name by this name so that multiple
   * publish tasks with different configurations can be defined in the same project.
   */
  readonly group?: string;
}
