/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, DependencyType, Project, TaskRuntime } from 'projen';

import { PyProjectTomlFile, PyProjectTomlOptions } from './files';

const PIP_TOOLS_VERSION = '==7.4.1';

/**
 * Core Python project files and tasks
 * around pyproject.toml
 */
export class PyProject extends Component {
  constructor(project: Project, opts: PyProjectOptions) {
    super(project);

    if (!opts.venvPath) {
      throw new Error('venvPath is required');
    }
    if (!opts.lockFile) {
      throw new Error('lockFile is required');
    }
    new PyProjectTomlFile(project, opts.package);

    this.project.addGitIgnore(`${opts.venvPath}/`);

    project.tasks.addTask('install', {
      description: `Install dependencies from ${opts.lockFile}`,
      exec: `${opts.venvPath}/bin/pip install --require-virtualenv -c ${opts.lockFile}`,
    });

    project.tasks.addTask('install-dev', {
      description: `Install dependencies from ${opts.lockFileDev}`,
      exec: `${opts.venvPath}/bin/pip install --require-virtualenv -c ${opts.lockFileDev} .[dev]`,
    });

    project.tasks.addTask('prepare-venv', {
      description: `Create python virtual environment in ${opts.venvPath}`,
      steps: [
        { exec: `${opts.pythonExec} -m venv ${opts.venvPath}` },
        {
          exec: `${opts.venvPath}/bin/pip install pip-tools${PIP_TOOLS_VERSION}`,
        },
      ],
    });

    project.tasks.addTask('update-lockfile', {
      description: `Update lock file (${opts.lockFile}) according to pyproject.toml`,
      steps: [
        {
          say: 'Prepare venv',
          spawn: 'prepare-venv',
        },
        {
          say: 'Updating lock file (runtime)',
          exec: `${opts.venvPath}/bin/pip-compile --all-build-deps --output-file=${opts.lockFile} pyproject.toml`,
        },
        {
          say: 'Updating lock file (dev)',
          exec: `${opts.venvPath}/bin/pip-compile --all-build-deps --extra dev --strip-extras --output-file=${opts.lockFileDev} pyproject.toml`,
        },
      ],
    });

    project.deps.addDependency(`pip-tools@${PIP_TOOLS_VERSION}`, DependencyType.DEVENV);

    project.tasks.addTask('build', {
      description: `Build project (install deps, compile and package)`,
      steps: [{ spawn: 'prepare-venv' }, { spawn: 'install-dev' }],
    });
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

export interface PyProjectOptions {
  /**
   * Options for pyproject.toml
   */
  readonly package?: PyProjectTomlOptions;
  /**
   * Path to the python virtual environment directory
   * used in this project
   * @default .venv
   */
  readonly venvPath?: string;
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
