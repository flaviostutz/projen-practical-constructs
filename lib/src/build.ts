/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project, TaskOptions } from 'projen';

import { Pip, PipOptions } from './components/pip';
import { Package, PackageOptions } from './components/package';
import { PythonVersionFile } from './files';

/**
 * Python project build configurations
 */
export class BuildTarget extends Component {
  constructor(project: Project, opts?: Build2Options) {
    super(project);

    project.tasks.addTask('build', {
      description: `Build project (install deps, compile and package)`,
    });

    // create package such as pyproject.toml, LICENSE etc
    new Package(project, opts?.package);

    // create pip resources such as tasks etc
    new Pip(project, { ...opts, attachTasksTo: 'build' });

    // create python-version (can be used by pyenv etc)
    const requiresPython = opts?.package?.requiresPython ?? '3.12';
    const pythonVersion = requiresPython.replace(/[^0-9.]/g, '');
    new PythonVersionFile(project, { pythonVersion });

    project.addGitIgnore('.ipynb_checkpoints');
  }
}

// This interface is not called BuildOptions because JSII doesn't allow the usage of name "build" on members
export interface Build2Options extends TaskOptions {
  readonly pip?: PipOptions;
  readonly package?: PackageOptions;
}
