import { Component, Project } from 'projen';

import { ReleaseTasks, ReleaseTasksOptions } from './release-tasks';

/**
 * Base tasks for projen projects based on
 * "common-targets" (https://github.com/flaviostutz/common-targets)
 */
export class CommonTargetsTasks extends Component {
  constructor(project: Project, opts?: BaseTasksOptions) {
    super(project);

    if (!opts?.build && !opts?.lint && !opts?.test && !opts?.release) {
      throw new Error('No tasks enabled. At least one task must be enabled');
    }

    // cleanup existing tasks
    project.tasks.removeTask('build');
    project.tasks.removeTask('test');
    project.tasks.removeTask('compile');
    project.tasks.removeTask('package');
    project.tasks.removeTask('pre-compile');
    project.tasks.removeTask('post-compile');

    if (opts?.build) {
      const buildTask = project.tasks.addTask('build', {
        description: `Build project (install -> compile -> package)`,
      });

      // default
      const defaultTask = project.tasks.tryFind('default');
      if (defaultTask) {
        buildTask.spawn(defaultTask);
      }

      // install
      buildTask.spawn(
        project.tasks.addTask('install', {
          description: `Install project dependencies`,
        }),
      );

      const compileTask = project.tasks.addTask('compile', {
        description: `Compile project`,
      });
      buildTask.spawn(compileTask);

      // package
      const packageTask = project.tasks.addTask('package', {
        description: `Prepare a distributable package`,
      });
      buildTask.spawn(packageTask);
    }

    if (opts?.lint) {
      project.tasks.addTask('lint', {
        description: `Lint project`,
      });
    }

    if (opts?.test) {
      project.tasks.addTask('test', {
        description: `Test project`,
      });
    }

    if (opts?.publish) {
      project.tasks.addTask('publish', {
        description: `Publish project artifacts to a repository`,
      });
    }

    if (opts?.deploy) {
      project.tasks.addTask('deploy', {
        description: `Deploy project runtime resources to an environment`,
        requiredEnv: ['STAGE'],
      });
    }

    if (opts?.release) {
      // eslint-disable-next-line no-new
      new ReleaseTasks(project, opts.releaseOpts);
    }
  }
}

export interface BaseTasksOptions {
  /**
   * Whether to include the build task with all its default subtasks
   */
  build?: boolean;
  /**
   * Whether to include the lint tasks
   */
  lint?: boolean;
  /**
   * Whether to include the test tasks
   */
  test?: boolean;
  /**
   * Whether to include release tasks
   */
  release?: boolean;
  /**
   * Release task options
   */
  releaseOpts?: ReleaseTasksOptions;
  /**
   * Whether to include deploy tasks
   */
  deploy?: boolean;
  /**
   * Whether to include publish tasks
   */
  publish?: boolean;
}
