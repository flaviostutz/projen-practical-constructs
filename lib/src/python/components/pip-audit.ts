/* eslint-disable no-new */
import { Component, DependencyType, Project } from 'projen';

import { addSpawnTaskToExisting, TaskOptions } from '../tasks';
import { CommonTargets } from '../../common/components/common-target-type';

export class PipAudit extends Component {
  constructor(project: Project, opts: TaskOptions) {
    super(project);

    project.deps.addDependency('pip-audit@2.*', DependencyType.DEVENV);
    project.addGitIgnore('.audit_cache');
    const lintAuditTask = project.tasks.addTask('lint-audit', {
      description: `Code type checks (mypy)`,
      exec: `${opts.venvPath}/bin/pip-audit --cache-dir .cache/.audit_cache`,
    });
    addSpawnTaskToExisting(project, lintAuditTask, CommonTargets.LINT);
  }
}
