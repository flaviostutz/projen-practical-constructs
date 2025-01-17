/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { Component, Project } from 'projen';

import { PyTest, PyTestOptions } from './components/pytest';
import { TaskOptions } from './tasks';

/**
 * Python project lint configurations
 */
export class TestTarget extends Component {
  constructor(project: Project, taskOpts: TaskOptions, opts?: TestOptions) {
    super(project);

    project.tasks.addTask('test', {
      description: `Test project (unit tests/coverage)`,
    });

    new PyTest(project, taskOpts, opts);
  }
}

export interface TestOptions extends PyTestOptions {}
