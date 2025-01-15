/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project } from 'projen';

import { MyPy } from './components/mypy';
import { Ruff, RuffOptions } from './components/ruff';
import { PipAudit } from './components/pip-audit';

/**
 * Python project lint configurations
 */
export class LintTarget extends Component {
  constructor(project: Project, opts: LintOptions) {
    super(project);

    project.tasks.addTask('lint', {
      description: `Lint project (format, type check, audit, lint)`,
    });

    project.tasks.addTask('lint-fix', {
      description: `Fix auto fixable lint issues`,
    });

    // MYPY - type checks
    new MyPy(project, { ...opts, attachTasksTo: 'lint' });

    // RUFF - linting and formatting
    new Ruff(project, { ...opts, attachTasksTo: 'lint', attachFixTaskTo: 'lint-fix' });

    // PIP-AUDIT - dependency vulnerability checks
    new PipAudit(project, { ...opts, attachTasksTo: 'lint' });
  }
}

export interface LintOptions extends RuffOptions {}
