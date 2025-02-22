/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { MyPyIniFile } from '../files';
import { addSpawnTaskToExisting, TaskOptions } from '../tasks';
import { CommonTargets } from '../../common/components/common-target-type';

export class MyPy extends Component {
  constructor(project: Project, taskOpts: TaskOptions) {
    super(project);

    new MyPyIniFile(project);
    project.deps.addDependency('mypy@1.14.*', DependencyType.DEVENV);
    project.addGitIgnore('.mypy_cache');
    const lintMypyTask = project.tasks.addTask('lint-mypy', {
      description: `Code type checks (mypy)`,
      exec: `${taskOpts.venvPath}/bin/mypy src tests`,
    });
    addSpawnTaskToExisting(project, lintMypyTask, CommonTargets.LINT);
  }
}
