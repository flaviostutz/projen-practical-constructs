/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { addTaskToParent, TaskOptions } from '../tasks';
import { PyTestIniFile } from '../files/pytest-ini';
import { CoveragercFile, CoveragercFileOptions } from '../files/coveragerc';

export class PyTest extends Component {
  constructor(project: Project, opts: PyTestOptions) {
    super(project);
    new PyTestIniFile(project);
    new CoveragercFile(project, opts);
    project.deps.addDependency('pytest@8.3.*', DependencyType.DEVENV);
    project.deps.addDependency('pytest-cov@6.0.*', DependencyType.DEVENV);
    project.addGitIgnore('.coverage');
    project.addGitIgnore('.pytest_cache');
    const lintUnitTask = project.tasks.addTask('test-unit', {
      description: `Unit tests (pytest)`,
      exec: `${opts.venvPath}/bin/pytest --cov=src`,
    });
    addTaskToParent(project, lintUnitTask, opts.attachTasksTo);
  }
}

export interface PyTestOptions extends TaskOptions, CoveragercFileOptions {}
