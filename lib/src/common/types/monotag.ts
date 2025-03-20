/**
 * Those are types derived from Monotag and should be kept in sync manually
 * We tried to use the types from the lib itself, but their are "types" (not interfaces)
 * and the lib is not prepared for jsii
 */

import { MONOTAG_VERSION } from '../constants';

/**
 * Options for analyzing and generating a new tag
 */
export interface NextTagOptions {
  /**
   * Command line used to invoke Monotag to perform tag calculations
   * @default 'npx monotag@1.14.0'
   */
  readonly monotagCmd?: string;
  /**
   * Extra arguments to be added to every invocation of Monotag
   * @default ''
   */
  readonly monotagExtraArgs?: string;

  // from BasicOptions in Monotag
  /**
   * Directory where the git repository is located
   * Defaults to local directory
   * @default '.'
   */
  readonly repoDir?: string;
  /**
   * Path inside repository for looking for changes
   * Defaults to any path
   * @default ''
   */
  readonly path?: string;
  /**
   * Git ref range (starting point) for searching for changes in git log history
   * @default latest tag
   */
  readonly fromRef?: string;
  /**
   * Git ref range (ending point) for searching for changes in git log history
   * Defaults to HEAD
   * @default HEAD
   */
  readonly toRef?: string;
  /**
   * Only take into consideration git commits that follows the conventional commits format
   * while rendering release notes
   * @default false
   */
  readonly onlyConvCommit?: boolean;
  /**
   * Output messages about what is being done
   * Such as git commands being executed etc
   * @default false
   */
  readonly verbose?: boolean;

  // from NextTagOptions in Monotag
  /**
   * Tag prefix to look for latest tag and for generating the tag
   * @default ''
   */
  readonly tagPrefix?: string;
  /**
   * Tag suffix to add to the generated tag
   * When using pre-release capabilities, that will manage and increment prerelease versions,
   * this will be added to the generated version.
   * E.g.: 1.0.0-beta.1-MY_SUFFIX, if tagSuffix is '-MY_SUFFIX'
   * @default ''
   */
  readonly tagSuffix?: string;
  /**
   * Which level to increment the version.
   * If undefined, it will be automatic, based on commit messages
   * @default undefined
   */
  readonly semverLevel?: 'major' | 'minor' | 'patch' | 'none';

  /**
   * Minimum version for the generated tag.
   * If the naturally incremented version is lower, this value will be used
   * @default no limit
   */
  readonly minVersion?: string;
  /**
   * Maximum version for the generated tag.
   * If the generated version is higher than this, the operation will fail
   * @default no limit
   */
  readonly maxVersion?: string;
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
  readonly preRelease?: boolean;
  /**
   * Pre-release identifier
   * @default 'beta'
   */
  readonly preReleaseIdentifier?: string;
  /**
   * If true, the pre-release version will always be incremented
   * even if no changes are detected
   * So subsequent calls to 'nextTag' will always increment the pre-release version
   * @default false
   */
  readonly preReleaseAlwaysIncrement?: boolean;
  /**
   * File that will be written with the tag name (e.g.: myservice/1.2.3-beta.0)
   * @default undefined (won't be created)
   */
  readonly tagFile?: string;
  /**
   * File that will be written with the version (e.g.: 1.2.3-beta.0)
   * @default undefined (won't be created)
   */
  readonly versionFile?: string;
  /**
   * File that will be written with the notes with the changes detected
   * The content will be a markdown with a list of commits
   * @default undefined (won't be created)
   */
  readonly notesFile?: string;
  /**
   * File with the changelog that will be updated with the new version
   * During update, this will check if the version is already present in the changelog
   * and skip generation if it's already there.
   * Normally this file is named CHANGELOG.md
   * @default undefined (won't be created)
   */
  readonly changelogFile?: string;

  /**
   * Configure git cli with username
   * Required if action is 'commit', 'tag' or 'push'
   */
  readonly gitUsername?: string;
  /**
   * Configure git cli with email
   * Required if action is 'commit', 'tag' or 'push'
   */
  readonly gitEmail?: string;

  /**
   * Bump action to be performed after the tag is generated
   * in regard to package files such as package.json, pyproject.yml etc
   * Should be one of:
   *   - 'latest': bump the version field of the files to the calculated tag
   *   - 'zero': bump the version field of the files to 0.0.0
   *   - 'none': won't change any files
   * @default 'none'
   */
  readonly bumpAction?: 'latest' | 'zero' | 'none';
  /**
   * Files to be bumped with the latest version
   * It will search for a "version" attribute in the file, replace it with the new version and save
   * If the field doesn't exist, it won't be changed
   * @default ['package.json']
   */
  readonly bumpFiles?: string[];
}

export const expandMonotagCmd = (monotagCmd: string | undefined): string => {
  return monotagCmd ?? `npx -y monotag@${MONOTAG_VERSION}`;
};
