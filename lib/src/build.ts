/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project } from 'projen';

import { Pip, PipOptions } from './components/pip';
import { Package, PackageOptions } from './components/package';
import { PythonVersionFile } from './files';
import { TaskOptions } from './tasks';

/**
 * Python project build configurations
 */
export class BuildTarget extends Component {
  constructor(project: Project, taskOpts: TaskOptions, opts?: Build0Options) {
    super(project);

    project.tasks.addTask('build', {
      description: `Build project (install deps, compile and package)`,
    });

    // create package such as pyproject.toml, LICENSE etc
    new Package(project, opts?.package);

    // create pip resources such as tasks etc
    new Pip(project, taskOpts, opts?.pip);

    // create python-version (can be used by pyenv etc)
    const requiresPython = opts?.package?.requiresPython ?? '3.12';
    const pythonVersion = requiresPython.replace(/[^0-9.]/g, '');
    new PythonVersionFile(project, { pythonVersion });

    project.addGitIgnore('.ipynb_checkpoints');
  }
}

// This interface is not called BuildOptions because JSII doesn't allow the usage of name "build" on members
export interface Build0Options {
  readonly pip?: PipOptions;
  readonly package?: PackageOptions;
}
