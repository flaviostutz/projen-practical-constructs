/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { MyPyIniFile } from '../files';
import { addTaskToParent, TaskOptions } from '../tasks';

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
    addTaskToParent(project, lintMypyTask, taskOpts.attachTasksTo);
  }
}
