/* eslint-disable no-new */
import { Component, DependencyType, Project, TaskRuntime } from 'projen';

import { TaskOptions } from '../tasks';

const PIP_TOOLS_VERSION = '==7.4.1';

export class Pip extends Component {
  constructor(project: Project, taskOpts: TaskOptions, opts?: PipOptions) {
    super(project);

    // default options
    const optsd: PipOptions = {
      pythonExec: 'python',
      lockFile: 'constraints.txt',
      lockFileDev: 'constraints-dev.txt',
      ...opts,
    };

    // add git ignore patterns
    project.addGitIgnore(`${taskOpts.venvPath}/`);
    project.addGitIgnore('*.egg-info');
    project.addGitIgnore('build');
    project.addGitIgnore('*.pyc');
    project.addGitIgnore('__pycache__');
    project.addGitIgnore('.cache');

    // add build related tasks
    project.tasks.addTask('install', {
      description: `Install dependencies from ${optsd.lockFile}`,
      exec: `${taskOpts.venvPath}/bin/pip install --require-virtualenv -c ${optsd.lockFile}`,
    });

    const installDevTask = project.tasks.addTask('install-dev', {
      description: `Install dependencies from ${optsd.lockFileDev}`,
      exec: `${taskOpts.venvPath}/bin/pip install --require-virtualenv -c ${optsd.lockFileDev} --editable .[dev]`,
    });

    const prepareVenvTask = project.tasks.addTask('prepare-venv', {
      description: `Create python virtual environment in ${taskOpts.venvPath}`,
      steps: [
        { exec: `${optsd.pythonExec} -m venv ${taskOpts.venvPath}` },
        {
          exec: `${taskOpts.venvPath}/bin/pip install pip-tools${PIP_TOOLS_VERSION}`,
        },
      ],
    });

    project.tasks.addTask('update-lockfile', {
      description: `Update lock file (${optsd.lockFile}) according to pyproject.toml`,
      steps: [
        {
          say: 'Prepare venv',
          spawn: 'prepare-venv',
        },
        {
          say: 'Updating lock file (runtime)',
          exec: `${taskOpts.venvPath}/bin/pip-compile --all-build-deps --output-file=${optsd.lockFile} pyproject.toml`,
        },
        {
          say: 'Updating lock file (dev)',
          exec: `${taskOpts.venvPath}/bin/pip-compile --all-build-deps --extra dev --strip-extras --output-file=${optsd.lockFileDev} pyproject.toml`,
        },
      ],
    });

    project.deps.addDependency(`pip-tools@${PIP_TOOLS_VERSION}`, DependencyType.DEVENV);

    if (taskOpts.attachTasksTo) {
      const attachTask = project.tasks.tryFind(taskOpts.attachTasksTo);
      if (!attachTask) {
        throw new Error(`'${taskOpts.attachTasksTo}' task not found`);
      }
      attachTask.spawn(prepareVenvTask);
      attachTask.spawn(installDevTask);
    }
  }

  public postSynthesize(): void {
    super.postSynthesize();

    this.project.logger.info('Initial preparation...');

    // run prepare venv, update lockfile and build
    const runtime = new TaskRuntime(this.project.outdir);
    runtime.runTask('prepare-venv');
    runtime.runTask('update-lockfile');
    runtime.runTask('build');
  }
}

export interface PipOptions {
  /**
   * Python executable path to be used while creating the virtual environment
   * used in this project
   * @default python
   */
  readonly pythonExec?: string;
  /**
   * Name of the file used to install dependencies from
   * This file is derived from pyproject.toml and have to be
   * manually updated if pyproject.toml is updated by using
   * the projen task 'update-lockfile'.
   * This lock won't include "dev" dependencies
   * Read more at https://stackoverflow.com/questions/34645821/pip-constraints-files
   * @default constraints.txt
   */
  readonly lockFile?: string;
  /**
   * Same as lockFile, but it includes all dev dependencies
   * @default constraints-dev.txt
   */
  readonly lockFileDev?: string;
}
