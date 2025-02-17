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

    if (opts?.build) {
      const buildTask = project.tasks.addTask('build', {
        description: `Build project (install -> compile -> package)`,
      });

      // install
      buildTask.spawn(
        project.tasks.addTask('install', {
          description: `Install project dependencies`,
        }),
      );

      // compile
      if (opts.buildLifecycleTasks) {
        buildTask.spawn(project.tasks.addTask('compile:pre'));
      }

      const compileTask = project.tasks.addTask('compile', {
        description: `Compile project`,
      });
      buildTask.spawn(compileTask);

      if (opts.buildLifecycleTasks) {
        buildTask.spawn(project.tasks.addTask('compile:pre'));
      }

      // package
      if (opts.buildLifecycleTasks) {
        buildTask.spawn(project.tasks.addTask('package:pre'));
      }

      const packageTask = project.tasks.addTask('package', {
        description: `Prepare a distributable package`,
      });
      buildTask.spawn(packageTask);

      if (opts.buildLifecycleTasks) {
        buildTask.spawn(project.tasks.addTask('package:pre'));
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

      if (opts?.release) {
        // eslint-disable-next-line no-new
        new ReleaseTasks(project, opts.releaseOpts);
      }
    }
  }
}

export interface BaseTasksOptions {
  /**
   * Whether to include the build task with all its default subtasks
   */
  build?: boolean;
  /**
   * Whether to include pre/post placeholder tasks to each step in build
   */
  buildLifecycleTasks?: boolean;
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
}
