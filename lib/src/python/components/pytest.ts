/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { addSpawnTaskToExisting, TaskOptions } from '../tasks';
import { PyTestIniFile, PyTestIniOptions } from '../files/pytest-ini';
import { CoveragercFile, CoveragercFileOptions } from '../files/coveragerc';
import { CommonTargets } from '../../common/components/common-target-type';

export class PyTest extends Component {
  constructor(project: Project, taskOpts: TaskOptions, opts?: PyTestOptions) {
    super(project);

    new PyTestIniFile(project);
    new CoveragercFile(project, opts);
    project.deps.addDependency('pytest@8.3.*', DependencyType.DEVENV);
    project.deps.addDependency('pytest-cov@6.0.*', DependencyType.DEVENV);
    project.addGitIgnore('.coverage');
    project.addGitIgnore('.pytest_cache');
    const lintUnitTask = project.tasks.addTask('test-unit', {
      description: `Unit tests (pytest)`,
      exec: `${taskOpts.venvPath}/bin/pytest`,
    });
    addSpawnTaskToExisting(project, lintUnitTask, CommonTargets.TEST);
  }
}

export interface PyTestOptions extends CoveragercFileOptions, PyTestIniOptions {}
