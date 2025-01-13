/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project } from 'projen';

import { Pip, PipOptions } from './components/pip';

/**
 * Python project build configurations
 */
export class BuildTarget extends Component {
  constructor(project: Project, opts: BuildOptions) {
    super(project);

    if (!opts.venvPath) {
      throw new Error('venvPath is required');
    }
    if (!opts.lockFile) {
      throw new Error('lockFile is required');
    }

    project.tasks.addTask('build', {
      description: `Build project (install deps, compile and package)`,
    });

    new Pip(project, { ...opts, attachTasksTo: 'build' });

    project.addGitIgnore('.ipynb_checkpoints');
  }
}

export interface BuildOptions extends PipOptions {}
