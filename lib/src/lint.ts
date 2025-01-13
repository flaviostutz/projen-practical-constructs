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

    // MYPY - type checks
    new MyPy(project, { ...opts, attachTasksTo: 'lint' });

    // RUFF - linting and formatting
    new Ruff(project, { ...opts, attachTasksTo: 'lint' });

    // PIP-AUDIT - dependency vulnerability checks
    new PipAudit(project, { ...opts, attachTasksTo: 'lint' });
  }
}

export interface LintOptions extends RuffOptions {}
