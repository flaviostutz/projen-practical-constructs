/* eslint-disable no-process-env */
import { Component, Project } from 'projen';

import { BasePublishOptions } from './common';

/**
 * Publish JS packages in a directoty to a Npm registry
 */
export class PublishNpmTasks extends Component {
  public taskName: string;

  constructor(project: Project, opts: PublishNpmOptions) {
    super(project);

    if (!opts.packagesDir) {
      throw new Error('packagesDir is required');
    }

    const optsWithDefaults = {
      registryUrl: 'https://registry.npmjs.org/',
      ...opts,
    };

    const taskName = `publish-npm${optsWithDefaults.group ? `-${optsWithDefaults.group}` : ''}`;
    project.removeTask(taskName);
    const t = project.addTask(taskName, {
      description: `Publish JS packages to a NPM registry. See https://www.npmjs.com/package/publib for more details about environment variables supported to control publishing configurations.`,
      steps: [
        {
          name: 'check-credentials',
          exec: '[ -z "$NPM_TOKEN" ] && { echo "ENV var NPM_TOKEN is required"; return 1 }',
        },
        {
          name: 'check-package-exists',
          exec: `[ -z "$(ls -A ${optsWithDefaults.packagesDir}/*.tgz 2>/dev/null)" ] && { echo "No packages found in dir ${optsWithDefaults.packagesDir}"; return 1; }`,
        },
        {
          name: 'publish-package',
          env: { NPM_REGISTRY: process.env.NPM_REGISTRY ?? optsWithDefaults.registryUrl },
          exec: `npx -y -p publib publib-npm ${optsWithDefaults.packagesDir}`,
        },
      ],
    });
    this.taskName = t.name;
  }
}

export interface PublishNpmOptions extends BasePublishOptions {
  /**
   * All JS packages in this directory will be published (*.tgz).
   * Fails if no package is found.
   * @default "dist/js"
   */
  readonly packagesDir: string;
}
