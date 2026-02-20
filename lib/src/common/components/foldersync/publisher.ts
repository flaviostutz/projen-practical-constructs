/* eslint-disable no-new */
import { Component, Project, SampleFile } from 'projen';

/**
 * FolderSyncPublisher marks a folder in the current project to be published as
 * part of the npm package so that consumer projects can pull its contents into
 * their own workspace using FolderSyncConsumer.
 *
 * Any folder structure works – markdown docs, JSON schemas, templates, etc.
 *
 * Usage in .projenrc.ts:
 * ```ts
 * const project = new SomeNodeProject({ ... });
 * new FolderSyncPublisher(project, { sourceDir: 'shared-docs' });
 * ```
 *
 * Then simply place files under `shared-docs/` in the repository.
 */
export class FolderSyncPublisher extends Component {
  /**
   * The directory (relative to the project root) whose contents will be published.
   */
  readonly sourceDir: string;

  constructor(project: Project, opts?: FolderSyncPublisherOptions) {
    super(project);

    this.sourceDir = opts?.sourceDir ?? 'shared-docs';

    // In .npmignore-based Node projects, projen ignores most source files by default.
    // We negate the ignore so the source folder gets included in the published package.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectAny = project as any;
    if (typeof projectAny.addPackageIgnore === 'function') {
      projectAny.addPackageIgnore(`!/${this.sourceDir}`);
      projectAny.addPackageIgnore(`!/${this.sourceDir}/**`);
    }

    if (opts?.addSampleReadme ?? true) {
      new SampleFile(project, `${this.sourceDir}/README.md`, {
        contents: `# Shared Folder

This folder is published as part of the npm package.

Consumer projects can use \`FolderSyncConsumer\` (from projen-practical-constructs)
to pull any subset of these files into their own workspace, version-controlled
via the package dependency.

## Rolling out changes

1. Add or update files in this folder.
2. Commit and bump the package version.
3. Consumers update the dependency version and re-run \`projen\` to receive the changes.
`,
      });
    }
  }
}

export interface FolderSyncPublisherOptions {
  /**
   * Directory (relative to the project root) whose contents will be published.
   * @default 'shared-docs'
   */
  readonly sourceDir?: string;

  /**
   * Add a sample README.md inside the source directory on first synthesis.
   * @default true
   */
  readonly addSampleReadme?: boolean;
}
