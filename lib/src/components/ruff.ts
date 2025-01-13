/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { addTaskToParent, TaskOptions } from '../tasks';
import { RuffTomlFile, RuffTomlFileOptions } from '../files/ruff-toml';

export class Ruff extends Component {
  constructor(project: Project, opts: RuffOptions) {
    super(project);

    new RuffTomlFile(project, opts.ruffToml);
    project.deps.addDependency('ruff@0.8.*', DependencyType.DEVENV);
    project.addGitIgnore('.ruff_cache');
    const lintRuffTask = project.tasks.addTask('lint-ruff', {
      description: `Code checks (RUFF)`,
      steps: [
        {
          exec: `${opts.venvPath}/bin/ruff format --check src tests`,
        },
        {
          exec: `${opts.venvPath}/bin/ruff check src tests`,
        },
      ],
    });
    addTaskToParent(project, lintRuffTask, opts.attachTasksTo);
  }
}

export interface RuffOptions extends TaskOptions {
  /**
   * Ruff configuration file options
   */
  readonly ruffToml?: RuffTomlFileOptions;
}
