/* eslint-disable no-new */
/* eslint-disable functional/no-try-statements */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
import * as fs from 'node:fs';
// eslint-disable-next-line unicorn/import-style
import * as path from 'node:path';

import { minimatch } from 'minimatch';
import { Component, Project } from 'projen';

import { FolderSyncDocument } from '../../files/foldersync-document';

/**
 * FolderSyncConsumer pulls files from one or more npm packages that were
 * published with FolderSyncPublisher and writes them as managed (read-only)
 * files into the consumer project's workspace.
 *
 * Files are re-written on every `projen` run, giving you a controlled rollout:
 * bump the source package version, run `projen`, and the new/updated files
 * appear in your repo.
 *
 * Works with any folder content – markdown docs, JSON schemas, templates, etc.
 *
 * Usage in .projenrc.ts:
 * ```ts
 * const project = new SomeProject({ ... });
 * new FolderSyncConsumer(project, {
 *   outputDir: 'docs/decisions',
 *   sources: [
 *     {
 *       package: '@my-org/shared-docs',
 *       sourceDir: 'shared-docs',
 *       // only files matching these glob patterns
 *       includeGlob: ['**\/*.md', 'schemas/**'],
 *       // only files whose content matches this regex
 *       contentMatch: /## Decision/,
 *     },
 *   ],
 * });
 * ```
 */
export class FolderSyncConsumer extends Component {
  constructor(project: Project, opts: FolderSyncConsumerOptions) {
    super(project);

    const outputDir = opts.outputDir ?? 'docs/shared';

    for (const source of opts.sources) {
      this.consumeSource(project, source, outputDir);
    }
  }

  private consumeSource(project: Project, source: FolderSyncSourceSpec, outputDir: string): void {
    const sourceDir = source.sourceDir ?? 'shared-docs';
    const globPatterns = toArray(source.includeGlob);
    const contentPattern = resolveRegExp(source.contentMatch);

    // Resolve the package location inside node_modules at synthesis time.
    const pkgRoot = resolvePkgRoot(source.package);
    if (!pkgRoot) {
      project.logger.warn(
        `FolderSyncConsumer: package '${source.package}' not found in node_modules. ` +
          `Make sure it is installed before running projen.`,
      );
      return;
    }

    const srcDir = path.join(pkgRoot, sourceDir);
    if (!fs.existsSync(srcDir)) {
      project.logger.warn(
        `FolderSyncConsumer: source directory '${sourceDir}' not found inside package '${source.package}'. ` +
          `Ensure the source project uses FolderSyncPublisher with the same sourceDir.`,
      );
      return;
    }

    const matchingFiles = listFilesRecursively(srcDir)
      // 1. glob filter: file path must match at least one pattern (if any supplied)
      .filter(
        (f) =>
          globPatterns.length === 0 || globPatterns.some((g) => minimatch(f, g, { dot: true })),
      )
      // read contents once, then apply optional content filter
      .map((relFile) => ({
        relFile,
        contents: fs.readFileSync(path.join(srcDir, relFile), 'utf8'),
      }))
      // 2. content filter: file contents must match the regex (if supplied)
      .filter(({ contents }) => !contentPattern || contentPattern.test(contents));

    for (const { relFile, contents } of matchingFiles) {
      new FolderSyncDocument(project, path.posix.join(outputDir, relFile), contents);
    }
  }
}

/** Resolve a string or RegExp to a RegExp, or undefined for "match all". */
function resolveRegExp(value?: RegExp | string): RegExp | undefined {
  if (!value) return;
  return value instanceof RegExp ? value : new RegExp(value);
}

/** Normalise an optional single value or array into a (possibly empty) array. */
function toArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Safely resolve an npm package root path. Returns undefined when not installed. */
function resolvePkgRoot(packageName: string): string | undefined {
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`));
  } catch {
    // eslint-disable-next-line no-useless-return
    return; // required for noImplicitReturns — package not installed
  }
}

/**
 * Recursively list all files under a directory, returning paths relative to that directory.
 * Uses forward slashes for consistent regex matching regardless of OS.
 */
function listFilesRecursively(dir: string, base = ''): readonly string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    return entry.isDirectory()
      ? listFilesRecursively(path.join(dir, entry.name), relPath)
      : [relPath];
  });
}

export interface FolderSyncConsumerOptions {
  /**
   * Directory in the consumer project where synced files will be placed.
   * @default 'docs/shared'
   */
  readonly outputDir?: string;

  /**
   * List of packages to sync files from.
   */
  readonly sources: FolderSyncSourceSpec[];
}

export interface FolderSyncSourceSpec {
  /**
   * The npm package name that was published with FolderSyncPublisher.
   */
  readonly package: string;

  /**
   * The directory inside the source package that holds the files to sync.
   * Must match the `sourceDir` used in FolderSyncPublisher of that package.
   * @default 'shared-docs'
   */
  readonly sourceDir?: string;

  /**
   * Glob pattern(s) matched against each file's relative path inside the source
   * directory. Only files that match at least one pattern are included.
   * When omitted, all files pass the path filter.
   *
   * @example '**\/*.md'           – only markdown files
   * @example ['adr/**', 'rfc/**'] – files in either the adr/ or rfc/ sub-folder
   * @example '001-*'              – files whose name starts with "001-"
   */
  readonly includeGlob?: string | string[];

  /**
   * A regex (or string compiled to a regex) matched against the full contents
   * of each file. Only files whose content satisfies the pattern are included.
   * When omitted, all files pass the content filter.
   *
   * @example /## Decision/        – files that contain a "## Decision" heading
   * @example 'status: accepted'   – files that contain a specific status line
   */
  readonly contentMatch?: RegExp | string;
}
