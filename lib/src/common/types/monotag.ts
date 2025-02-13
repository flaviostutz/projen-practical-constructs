/**
 * Those are types derived from Monotag and should be kept in sync manually
 * We tried to use the types from the lib itself, but their are "types" (not interfaces)
 * and the lib is not prepared for jsii
 */

/**
 * Options for analyzing and generating a new tag
 */
export interface NextTagOptions {
  // from BasicOptions in Monotag
  /**
   * Directory where the git repository is located
   * Defaults to local directory
   */
  repoDir: string;
  /**
   * Path inside repository for looking for changes
   * Defaults to any path
   */
  path: string;
  /**
   * Git ref range (starting point) for searching for changes in git log history
   * @default latest tag
   */
  fromRef?: string;
  /**
   * Git ref range (ending point) for searching for changes in git log history
   * Defaults to HEAD
   * @default HEAD
   */
  toRef?: string;
  /**
   * Only take into consideration git commits that follows the conventional commits format
   * while rendering release notes
   * @default false
   */
  onlyConvCommit?: boolean;
  /**
   * Output messages about what is being done
   * Such as git commands being executed etc
   * @default false
   */
  verbose?: boolean;

  // from NextTagOptions in Monotag
  /**
   * Tag prefix to look for latest tag and for generating the tag
   */
  tagPrefix: string;
  /**
   * Tag suffix to add to the generated tag
   * When using pre-release capabilities, that will manage and increment prerelease versions,
   * this will be added to the generated version.
   * E.g.: 1.0.0-beta.1-MY_SUFFIX, if tagSuffix is '-MY_SUFFIX'
   * @default ''
   */
  tagSuffix?: string;
  /**
   * Which level to increment the version.
   * If undefined, it will be automatic, based on commit messages
   * @default undefined
   */
  semverLevel?: 'major' | 'minor' | 'patch' | 'none';

  /**
   * Minimum version for the generated tag.
   * If the naturally incremented version is lower, this value will be used
   * @default no limit
   */
  minVersion?: string;
  /**
   * Maximum version for the generated tag.
   * If the generated version is higher than this, the operation will fail
   * @default no limit
   */
  maxVersion?: string;
  /**
   * If the generated version is a pre-release
   * This will add a pre-release identifier to the version. E.g.: 1.0.0-beta
   * This will automatically create a pre-release version depending on the semverLevel
   * identified by commit message analysis based on conventional commits.
   * For example, if the commits contain a breaking change, the version will be a major pre-release.
   * So if it was 1.2.2, it will be 2.0.0-beta. If it was 3.2.1, it will be 4.0.0-beta.
   * The same applies for minor and patch levels.
   * @default false
   */
  preRelease?: boolean;
  /**
   * Pre-release identifier
   * @default 'beta'
   */
  preReleaseIdentifier?: string;
  /**
   * If true, the pre-release version will always be incremented
   * even if no changes are detected
   * So subsequent calls to 'nextTag' will always increment the pre-release version
   * @default false
   */
  preReleaseAlwaysIncrement?: boolean;
  /**
   * File that will be written with the tag name (e.g.: myservice/1.2.3-beta.0)
   * @default undefined (won't be created)
   */
  tagFile?: string;
  /**
   * File that will be written with the version (e.g.: 1.2.3-beta.0)
   * @default undefined (won't be created)
   */
  versionFile?: string;
  /**
   * File that will be written with the notes with the changes detected
   * The content will be a markdown with a list of commits
   * @default undefined (won't be created)
   */
  notesFile?: string;
  /**
   * File with the changelog that will be updated with the new version
   * During update, this will check if the version is already present in the changelog
   * and skip generation if it's already there.
   * Normally this file is named CHANGELOG.md
   * @default undefined (won't be created)
   */
  changelogFile?: string;
}
