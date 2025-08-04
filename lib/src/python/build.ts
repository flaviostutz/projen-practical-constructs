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

    // create package such as pyproject.toml, LICENSE etc
    new Package(project, opts?.pkg);

    // create pip resources such as tasks etc
    new Pip(project, taskOpts, opts?.pip);

    // create python-version (can be used by pyenv etc)
    const requiresPython = opts?.pkg?.requiresPython ?? '3.12';
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const pythonVersion = requiresPython.replace(/[^\d.]/g, '');
    new PythonVersionFile(project, { pythonVersion });

    project.addGitIgnore('.ipynb_checkpoints');
  }
}

// This interface is not called BuildOptions because JSII doesn't allow the usage of name "build" on members
export interface Build0Options {
  readonly pip?: PipOptions;
  readonly pkg?: PackageOptions;
}
