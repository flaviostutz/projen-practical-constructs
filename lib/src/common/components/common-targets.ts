import { Component, Project } from 'projen';

/**
 * Base tasks for projen projects based on
 * "common-targets" (https://github.com/flaviostutz/common-targets)
 */
export class CommonTargetsTasks extends Component {
  constructor(project: Project, opts?: BaseTasksOptions) {
    super(project);

    if (opts?.build) {
      const buildTask = project.tasks.addTask('build', {
        description: `Build project (install -> compile -> package)`,
      });

      buildTask.spawn(project.tasks.addTask('install'));
      buildTask.spawn(project.tasks.addTask('pre-compile'));
      buildTask.spawn(project.tasks.addTask('compile'));
      buildTask.spawn(project.tasks.addTask('post-compile'));
      buildTask.spawn(project.tasks.addTask('pre-package'));
      buildTask.spawn(project.tasks.addTask('package'));
      buildTask.spawn(project.tasks.addTask('post-package'));
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
      const releaseTask = project.tasks.addTask('release', {
        description: `Prepare release`,
      });
      releaseTask.spawn(project.tasks.addTask('docgen'));
      releaseTask.spawn(project.tasks.addTask('version'));
      const packageTask = project.tasks.tryFind('package');
      if (packageTask) {
        releaseTask.spawn(packageTask);
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
   * Whether to include the lint tasks
   */
  lint?: boolean;
  /**
   * Whether to include the test tasks
   */
  test?: boolean;
  /**
   * Whether to include the release tasks
   */
  release?: boolean;
  /**
   * Whether to include the developer tasks with common targets
   * used by developers
   */
  developer?: boolean;
}
