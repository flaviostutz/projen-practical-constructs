/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project } from 'projen';

import { PyTest, PyTestOptions } from './components/pytest';

/**
 * Python project lint configurations
 */
export class TestTarget extends Component {
  constructor(project: Project, opts: TestOptions) {
    super(project);

    project.tasks.addTask('test', {
      description: `Test project (unit tests/coverage)`,
    });

    new PyTest(project, { ...opts, attachTasksTo: 'test' });
  }
}

export interface TestOptions extends PyTestOptions {}
