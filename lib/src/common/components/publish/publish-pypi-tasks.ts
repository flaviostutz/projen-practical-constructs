/* eslint-disable no-process-env */
import { Component, Project } from 'projen';

import { BasePublishOptions } from './types';

/**
 * Publish Python packages in a directoty to a Pypi registry
 */
export class PublishPypiTasks extends Component {
  public taskName: string;

  constructor(project: Project, opts: PublishPypiOptions) {
    super(project);

    if (!opts.packagesDir) {
      throw new Error('packagesDir is required');
    }

    const optsWithDefaults = {
      registryUrl: 'https://upload.pypi.org/legacy/',
      ...opts,
    };

    const taskName = `publish-python${optsWithDefaults.group ? `-${optsWithDefaults.group}` : ''}`;
    project.removeTask(taskName);

    const t = project.addTask(taskName, {
      description: `Publish Python packages to a Pypi registry. See https://www.npmjs.com/package/publib for more details about environment variables supported to control publishing configurations.`,
      steps: [
        {
          name: 'check-credentials',
          exec: '[ -z "$TWINE_USERNAME" ] && { echo "ENV var TWINE_USERNAME is required"; return 1 } || [ -z "$TWINE_PASSWORD" ] && { echo "ENV var TWINE_PASSWORD is required"; return 1 }',
        },
        {
          name: 'check-package-exists',
          exec: `[ -z "$(ls -A ${optsWithDefaults.packagesDir}/*.whl 2>/dev/null)" ] && { echo "No packages found in dir ${optsWithDefaults.packagesDir}"; return 1; }`,
        },
        {
          name: 'publish-package',
          env: {
            TWINE_REPOSITORY_URL: process.env.TWINE_REPOSITORY_URL ?? optsWithDefaults.registryUrl,
          },
          exec: `npx -y -p publib publib-pypi ${optsWithDefaults.packagesDir}`,
        },
      ],
    });
    this.taskName = t.name;
  }
}

export interface PublishPypiOptions extends BasePublishOptions {
  /**
   * All Python packages in this directory will be published (*.whl).
   * Fails if no package is found.
   * @default "dist/python"
   */
  packagesDir: string;
}
