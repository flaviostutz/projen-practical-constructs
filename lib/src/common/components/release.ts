// strict (HEAD must be tagged with tag with prefix)
// get latest tag from git, extract version, suffix version and bump package.json
// latest_tag="$(git describe --exact-match --tags $(git rev-parse HEAD) --match 'mytag/*')" || { echo 'HEAD commit is not tagged with prefix "mytag/"'; return 1; } && version=$(echo $latest_tag | grep -oE '[0-9]+\.[0-9]+\.[0-9]+.*') && new_version="${version}-beta" && sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$new_version\"/" package.json && echo "Version updated to $new_version in package.json"

import { Component, Project, Task } from 'projen';

/**
 * Create tasks to support the basics of creating a software release based on git tags
 * Tasks:
 *   - release: Workflow next-tag -> changelog -> docgen -> git-tag -> git-push
 *   - next-tag: Calculate the next version of the software and stores in version.txt, changelog.md and releasetag.txt. Supports complex release tagging in monorepos by using "npx monotag"
 *   - changelog: Update or create CHANGELOG.md file with new calculated version and release notes
 *   - docgen: Placeholder to be used by any project to add document generation tasks
 *   - git-tag: Commit all files and git tag with calculated release tag
 *   - git-push: Push commit and tag to remote git
 *   - bump: Update version in package.json, pyproject.toml etc based on version.txt file
 *   - unbump: Update version in package.json, pyproject.toml etc to "0.0.0"
 */
export class ReleaseTasks extends Component {
  public releaseTask: Task;

  public nextTagTask: Task;

  public changelogTask: Task;

  public docgenTask: Task;

  public gitTagTask: Task;

  public gitPushTask: Task;

  public bumpTask: Task;

  public unbumpTask: Task;

  constructor(project: Project, opts?: ReleaseTasksOptions) {
    super(project);

    const optsWithDefaults = getOptionsWithDefaults(opts);

    project.addGitIgnore(optsWithDefaults.releaseChangelogFile);
    project.addGitIgnore(optsWithDefaults.releaseTagFile);
    project.addGitIgnore(optsWithDefaults.releaseVersionFile);

    this.nextTagTask = project.addTask('next-tag', {
      description:
        'Calculate the next version of the software and stores in version.txt, changelog.md and releasetag.txt. Supports complex release tagging in monorepos by using "npx monotag"',
    });

    this.changelogTask = project.addTask('changelog', {
      description:
        'Update or create CHANGELOG.md file with new calculated version and release notes',
      steps: [
        {
          exec: `[ -f "${optsWithDefaults.releaseTagFile}" ] || { echo "File '${optsWithDefaults.releaseTagFile}' not found"; exit 1; }`,
        },
        {
          exec: `[ -f "${optsWithDefaults.releaseChangelogFile}" ] || { echo "File '${optsWithDefaults.releaseChangelogFile}' not found"; exit 1; }`,
        },
        {
          exec: `cat "${optsWithDefaults.releaseChangelogFile}" >> "${optsWithDefaults.projectChangelogFile}"`,
        },
      ],
    });

    this.docgenTask = project.addTask('docgen', {
      description: 'Placeholder to be used by any project to add document generation tasks',
    });

    this.gitTagTask = project.addTask('git-tag', {
      description: 'Commit all files and git tag with calculated release tag',
      steps: [
        {
          exec: `[ -f "${optsWithDefaults.releaseTagFile}" ] || { echo "File '${optsWithDefaults.releaseTagFile}' not found"; exit 1; }`,
        },
        {
          exec: `[ -f "${optsWithDefaults.releaseChangelogFile}" ] || { echo "File '${optsWithDefaults.releaseChangelogFile}' not found"; exit 1; }`,
        },
        {
          exec: `git add .`,
        },
        {
          exec: `git commit -m "chore(release): release $(cat ${optsWithDefaults.releaseTagFile})"`,
        },
        {
          builtin: 'release/tag-version',
          env: {
            CHANGELOG: optsWithDefaults.releaseChangelogFile,
            RELEASE_TAG_FILE: optsWithDefaults.releaseTagFile,
          },
        },
      ],
    });
    this.gitPushTask = project.addTask('git-push', {
      description: 'Push tag to remote git',
      steps: [
        {
          exec: `[ -f "${optsWithDefaults.releaseTagFile}" ] || { echo "File '${optsWithDefaults.releaseTagFile}' not found"; exit 1; }`,
        },
        { exec: `git push --follow-tags origin HEAD $(cat ${optsWithDefaults.releaseTagFile}` },
      ],
    });
    this.bumpTask = project.addTask('bump', {
      requiredEnv: ['GIT_TAG_PREFIX', 'VERSION_SUFFIX'],
      description: `Set version in package.json from ${optsWithDefaults.releaseVersionFile}. If this file is not found, try to get from git tag looking for tags prefixed by env GIT_TAG_PREFIX. Adds a suffix (env VERSION_SUFFIX) to the version if provided before bumping`,
      steps: [
        {
          condition: `[ -f "${optsWithDefaults.releaseVersionFile}" ]`,
          say: 'Get version from version file',
          exec: `new_version=$(cat ${optsWithDefaults.releaseVersionFile})" && sed -E 's/"version": "[^"]+"/"version": "$new_version' package.json && echo "Version updated to '$new_version' in package.json (from ${optsWithDefaults.releaseVersionFile})`,
          // latest_tag="$(git describe --exact-match --tags $(git rev-parse HEAD) --match 'mytag/*')" || { echo 'HEAD commit is not tagged with prefix "mytag/"'; return 1; } && version=$(echo $latest_tag | grep -oE '[0-9]+\.[0-9]+\.[0-9]+.*') && new_version="${version}-beta" && sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$new_version\"/" package.json && echo "Version updated to $new_version in package.json"
        },
        {
          condition: `[ ! -f "${optsWithDefaults.releaseVersionFile}" ]`,
          say: 'No version file found, trying to get version from git tag',
          exec: `latest_tag="$(git describe --exact-match --tags $(git rev-parse HEAD) --match '\${GIT_TAG_PREFIX}*')" || { echo 'HEAD commit is not tagged with prefix "\${GIT_TAG_PREFIX}"'; return 1; } && version=$(echo $latest_tag | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+.*') && new_version="\${version}\${VERSION_SUFFIX}" && sed -E 's/"version": "[^"]+"/"version": "$new_version"/' package.json && echo "Version updated to '$new_version' in package.json (from git tag)"`,
        },
      ],
    });
    this.unbumpTask = project.addTask('unbump', {
      description: 'Set version in package.json to "0.0.0"',
      steps: [
        {
          builtin: 'release/reset-version',
          env: { OUTFILE: 'package.json' },
        },
      ],
    });

    this.releaseTask = project.addTask('release', {
      description:
        'Release a new version by calculating next tag, generating change log, documentation, commiting, tagging and pushing these changes/tag to the repo. Workflow next-tag -> changelog -> docgen -> git-tag -> git-push',
      steps: [
        {
          spawn: 'release:pre',
        },
        {
          spawn: 'next-tag',
        },
        {
          spawn: 'release:prepare',
        },
        {
          spawn: 'unbump',
        },
        {
          spawn: 'git-push',
        },
        {
          spawn: 'release:post',
        },
      ],
    });
  }
}

const getOptionsWithDefaults = (opts?: ReleaseTasksOptions): Required<ReleaseTasksOptions> => {
  return {
    releaseVersionFile: 'dist/version.txt',
    releaseTagFile: 'dist/releasetag.txt',
    releaseChangelogFile: 'dist/changelog.md',
    projectChangelogFile: '',
    dryRun: true,
    prerelease: false,
    prereleaseIdentifier: 'beta',
    ...opts,
  };
};

export interface ReleaseTasksOptions {
  /**
   * Name of the file that will receive the next version number for the release inside artifacts dir
   * @default dist/version.txt
   */
  releaseVersionFile?: string;
  /**
   * Name of the file that will receive the release tag for the release inside artifacts dir
   * @default dist/releasetag.txt
   */
  releaseTagFile?: string;
  /**
   * Name of the file that will receive the changelog with release notes for the release inside artifacts dir
   * @default dist/changelog.md
   */
  releaseChangelogFile?: string;
  /**
   * If true, the release task will not commit or push changes to git
   * @default true
   */
  dryRun?: boolean;
  /**
   * Name of the file on the workspace of the project that is incremented at each release with the change log of the new version being created
   * @default CHANGELOG.md
   */
  projectChangelogFile?: string;
  /**
   * Add prerelease suffix to the generated tag and versions
   * e.g. 1.0.0-beta.1
   * @default false
   */
  prerelease?: boolean;
  /**
   * Prerelease identifier to be added to the generated tag and versions when prerelease is true
   * e.g. beta, alpha, rc -> will generate versions such as 1.0.0-beta.1, 1.0.0-alpha.1, 1.0.0-rc.1
   * @default 'beta'
   */
  prereleaseIdentifier?: string;
  /**
   * Prefix to be used when looking for tags in git to calculate the next version
   * @default 'auto' which means that the prefix will be automatically calculated from the project folder name
   */
  // tagPrefix?: NextTagOptions;
}
