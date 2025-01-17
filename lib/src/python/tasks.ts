import { Project, Task } from 'projen';

export interface TaskOptionsTarget {
  /**
   * Path to the python virtual environment directory
   * used in this project
   * @default .venv
   */
  readonly venvPath?: string;
  /**
   * Existing task to attach new tasks to.
   * It will be included as "spawn" tasks in new steps
   */
  readonly attachTasksTo?: string;
}

export interface TaskOptions {
  /**
   * Path to the python virtual environment directory
   * used in this project
   */
  readonly venvPath: string;
  /**
   * Existing task to attach new tasks to.
   * It will be included as "spawn" tasks in new steps
   */
  readonly attachTasksTo?: string;
}

export interface TaskOptionsWithFix extends TaskOptions {
  /**
   * Attach task to fix
   */
  readonly attachFixTasksTo?: string;
}

export const addTaskToParent = (project: Project, task: Task, parentTaskName?: string): void => {
  if (!parentTaskName) {
    return;
  }
  const attachTask = project.tasks.tryFind(parentTaskName);
  if (!attachTask) {
    throw new Error(`'${parentTaskName}' task not found`);
  }
  attachTask.spawn(task);
};
