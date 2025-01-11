import { stringify } from '@iarna/toml';
import { FileBase, Project } from 'projen';

import { PyProjectTomlOptions } from '../types/package-options';
import { WithRequired } from '../types/utils';

/** Package name format as in https://packaging.python.org/en/latest/specifications/name-normalization/ */
const PACKAGE_NAME_REGEX = /^([a-z0-9]|[A-z0-9][a-z0-9._-]*[a-z0-9])$/;

const VERSION_REGEX = /^(\d+\.\d+\.\d+)(-.+)?$/;

export type OptWithRequired = WithRequired<PyProjectTomlOptions, 'packageName' | 'version'>;

/**
 * pyproject.toml synthetisation
 */
export class PyProjectToml extends FileBase {
  public readonly opts: OptWithRequired;

  constructor(project: Project, opts?: PyProjectTomlOptions) {
    super(project, 'pyproject.toml');
    this.opts = getOptionsWithDefaults(project, opts);
  }

  protected synthesizeContent(): string | undefined {
    const contents = {
      'build-system': {
        requires: ['setuptools'],
        'build-backend': 'setuptools.build_meta',
      },
      project: {
        name: this.opts.packageName ?? '',
        version: this.opts.version ?? '',
        description: this.opts.description ?? '',
        readme: this.opts.readme ?? '',
        'requires-python': this.opts.requiresPython ?? '',
        license: '<LICENSE>',
        keywords: this.opts.keywords ?? [],
        // maintainers: this.opts.maintainers ?? [],
        dependencies: this.opts.dependencies ?? [],
      },
      // this name will be updated later
      // 'project.optional-dependencies'
      projectOptionalDependencies: {
        dev: this.opts.devDependencies ?? [],
      },
      // 'tool.setuptools.package-data'
      toolSetuptoolsPackageData: {
        packageDataPackageName: ['py.typed'],
      },
    };

    // we use those replacements becuse the toml library doesn't support these characters or nesting structures
    const tomlContents = stringify(contents)
      .replace('"<LICENSE>"', `{ file = "LICENSE" }`)
      .replace('projectOptionalDependencies', 'project.optional-dependencies')
      .replace('toolSetuptoolsPackageData', 'tool.setuptools.package-data')
      .replace('packageDataPackageName', `"${this.opts.packageName}"`);

    return tomlContents;
  }
}

const getOptionsWithDefaults = (project: Project, opts?: PyProjectTomlOptions): OptWithRequired => {
  // version
  let version = opts?.version;
  if (!version) {
    version = '0.0.1';
  }
  if (!VERSION_REGEX.test(version)) {
    throw new Error('Invalid version format. Must be in the format "X.Y.Z-<optional suffix>"');
  }
  return {
    ...opts,
    packageName: resolvePackageName(project.name, opts),
    version,
  };
};

export const resolvePackageName = (
  projectName: string,
  pyProjectOpts?: PyProjectTomlOptions,
): string => {
  let packageName = pyProjectOpts?.packageName;
  if (!packageName) {
    packageName = projectName;
  }
  if (!PACKAGE_NAME_REGEX.test(packageName!)) {
    throw new Error(
      `Invalid package name "${packageName}". Check requirements at https://packaging.python.org/en/latest/specifications/name-normalization/`,
    );
  }
  return packageName;
};
