/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { addTaskToParent, TaskOptionsWithFix } from '../tasks';
import { RuffTomlFile, RuffTomlFileOptions } from '../files/ruff-toml';

export class Ruff extends Component {
  constructor(project: Project, taskOpts: TaskOptionsWithFix, opts?: RuffOptions) {
    super(project);

    new RuffTomlFile(project, opts);
    project.deps.addDependency('ruff@0.8.*', DependencyType.DEVENV);
    project.addGitIgnore('.ruff_cache');
    const lintRuffTask = project.tasks.addTask('lint-ruff', {
      description: `Code checks (RUFF)`,
      steps: [
        {
          exec: `${taskOpts.venvPath}/bin/ruff format --check src tests`,
        },
        {
          exec: `${taskOpts.venvPath}/bin/ruff check src tests`,
        },
      ],
    });
    addTaskToParent(project, lintRuffTask, taskOpts.attachTasksTo);

    const lintFixRuffTask = project.tasks.addTask('lint-ruff-fix', {
      description: `Lint fix (RUFF)`,
      steps: [
        {
          exec: `${taskOpts.venvPath}/bin/ruff format src tests`,
        },
        {
          exec: `${taskOpts.venvPath}/bin/ruff check --fix src tests`,
        },
      ],
    });
    addTaskToParent(project, lintFixRuffTask, taskOpts.attachFixTasksTo);
  }
}

export interface RuffOptions extends RuffTomlFileOptions {
  /**
   * Attach lint fix tasks to parent
   */
  readonly attachFixTaskTo?: string;
}
