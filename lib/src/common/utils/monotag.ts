import { NextTagOptions } from '../types/monotag';

export const monotagCliArgs = (opts: NextTagOptions): string => {
  const args: string[] = [];

  // add only args that were defined
  pushIfDefined(args, 'bump-action', opts.bumpAction);
  pushIfDefined(args, 'bump-files', opts.bumpFiles?.join(','));
  pushIfDefined(args, 'changelog-file', opts.changelogFile);
  pushIfDefined(args, 'from-ref', opts.fromRef);
  pushIfDefined(args, 'git-email', opts.gitEmail);
  pushIfDefined(args, 'git-username', opts.gitUsername);
  pushIfDefined(args, 'max-version', opts.maxVersion);
  pushIfDefined(args, 'min-version', opts.minVersion);
  pushIfDefined(args, 'notes-file', opts.notesFile);
  pushIfDefined(args, 'conv-commit', opts.onlyConvCommit ? 'true' : '');
  pushIfDefined(args, 'path', opts.path);
  pushIfDefined(args, 'prerelease', opts.preRelease ? 'true' : '');
  pushIfDefined(args, 'prerelease-increment', opts.preReleaseAlwaysIncrement ? 'true' : '');
  pushIfDefined(args, 'prerelease-id', opts.preReleaseIdentifier);
  pushIfDefined(args, 'repoDir', opts.repoDir);
  pushIfDefined(args, 'semver-level', opts.semverLevel);
  pushIfDefined(args, 'tag-file', opts.tagFile);
  pushIfDefined(args, 'tag-prefix', opts.tagPrefix);
  pushIfDefined(args, 'tag-suffix', opts.tagSuffix);
  pushIfDefined(args, 'to-ref', opts.toRef);
  pushIfDefined(args, 'verbose', opts.verbose ? 'true' : '');
  pushIfDefined(args, 'version-file', opts.versionFile);

  // add extra args
  if (opts.monotagExtraArgs) {
    // eslint-disable-next-line functional/immutable-data
    args.push(opts.monotagExtraArgs.trim());
  }
  return args.join(' ').trim();
};

const pushIfDefined = (args: string[], argName: string, argValue?: string): void => {
  if (argValue) {
    // eslint-disable-next-line functional/immutable-data
    args.push(argValue ? `--${argName}="${argValue}"` : '');
  }
};
