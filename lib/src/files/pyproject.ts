/* eslint-disable no-restricted-syntax */
import { stringify } from '@iarna/toml';
import { DependencyType, FileBase, IResolver, Project } from 'projen';

import { WithRequired } from '../types/utils';

/** Package name format as in https://packaging.python.org/en/latest/specifications/name-normalization/ */
const PACKAGE_NAME_REGEX = /^([a-z0-9]|[A-z0-9][a-z0-9._-]*[a-z0-9])$/;

const VERSION_REGEX = /^(\d+\.\d+\.\d+)(-.+)?$/;

export type OptWithRequired = WithRequired<PyProjectTomlOptions, 'packageName' | 'version'>;

/**
 * pyproject.toml synthetisation
 */
export class PyProjectTomlFile extends FileBase {
  private readonly opts: OptWithRequired;

  constructor(project: Project, opts?: PyProjectTomlOptions) {
    super(project, 'pyproject.toml');
    this.opts = getOptionsWithDefaults(project, opts);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    // merge project and options dependencies
    const dependencies: string[] = [];
    const devDependencies: string[] = [];
    for (const dep of this.project.deps.all) {
      if (dep.type === DependencyType.RUNTIME) {
        dependencies.push(`${dep.name}@${dep.version}`);
      } else if (dep.type === DependencyType.DEVENV || dep.type === DependencyType.TEST) {
        devDependencies.push(`${dep.name}@${dep.version}`);
      }
    }

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
        dependencies: dependencies ?? [],
      },
      // 'project.optional-dependencies'
      projectOptionalDependencies: {
        dev: devDependencies ?? [],
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

export interface PyProjectTomlOptions {
  /**
   * Name of the python package. E.g. "my_python_package".
   * Must only consist of alphanumeric characters and underscores.
   * @default Name of the directory
   */
  readonly packageName?: string;
  /**
   * Author's name
   */
  readonly authorName?: string;
  /**
   * Author's e-mail
   */
  readonly authorEmail?: string;
  /**
   * Version of the package.
   */
  readonly version?: string;
  /**
   * Keywords to add to the package.
   */
  readonly keywords?: string[];
  /**
   * List of maintainers of the package.
   */
  // readonly maintainers?: { name: string; email: string }[];
  /**
   * List of dependencies for this project.
   */
  readonly dependencies?: string[];
  /**
   * List of dev dependencies for this project.
   */
  readonly devDependencies?: string[];
  /**
   * A short description of the package.
   */
  readonly description?: string;
  /**
   * A URL to the website of the project.
   */
  readonly homepage?: string;
  /**
   * README file.
   */
  readonly readme?: string;
  /**
   * License file
   */
  readonly licenseFile?: string;
  /**
   * Python version required to run this package
   */
  readonly requiresPython?: string;
  /**
   * A list of PyPI trove classifiers that describe the project.
   *
   * @see https://pypi.org/classifiers/
   */
  readonly classifiers?: string[];
}
