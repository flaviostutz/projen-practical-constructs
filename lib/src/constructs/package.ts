import { stringify } from '@iarna/toml';
import { FileBase, Project } from 'projen';

import { PyProjectTomlOptions } from '../types/package-options';

/** Package name format as in https://packaging.python.org/en/latest/specifications/name-normalization/ */
const PACKAGE_NAME_REGEX = /^([a-z0-9]|[A-z0-9][a-z0-9._-]*[a-z0-9])$/;

const VERSION_REGEX = /^(\d+\.\d+\.\d+)(-.+)?$/;

/**
 * pyproject.toml synthetisation
 */
export class PyProjectToml extends FileBase {
  private readonly opts: PyProjectTomlOptions;

  constructor(scope: Project, opts: PyProjectTomlOptions) {
    if (!PACKAGE_NAME_REGEX.test(opts.packageName)) {
      throw new Error(
        'Invalid package name. Check requirements at https://packaging.python.org/en/latest/specifications/name-normalization/',
      );
    }
    if (!VERSION_REGEX.test(opts.version)) {
      throw new Error('Invalid version format. Must be in the format "X.Y.Z-<optional suffix>"');
    }
    super(scope, 'pyproject.toml');
    this.opts = opts;
  }

  protected synthesizeContent(): string | undefined {
    const contents = {
      'build-system': {
        requires: ['setuptools'],
        'build-backend': 'setuptools.build_meta',
      },
      project: {
        name: this.opts.packageName,
        version: this.opts.version,
        description: this.opts.description ?? '',
        readme: this.opts.readme ?? '',
        'requires-python': this.opts.requiresPython ?? '',
        license: {
          file: this.opts.licenseFile ?? '',
        },
        keywords: this.opts.keywords ?? [],
        // maintainers: this.opts.maintainers ?? [],
        dependencies: this.opts.dependencies ?? [],
      },
      'project.optional-dependencies': {
        dev: this.opts.devDependencies ?? [],
      },
      //   'tool.setuptools.package-data': {
      //     hello_world: ['py.typed'],
      //   },
    };

    return stringify(contents);
  }
}
