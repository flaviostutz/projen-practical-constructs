/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */

import { DependencyType, License, LicenseOptions, Project, ProjectOptions } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { resolvePackageName } from './files/pyproject-toml';
import { PythonVersionFile } from './files/python-version';
import { addDefaultGitIgnore } from './utils/addDefaultGitIgnore';
import { PythonBasicSample } from './sample';
import { PyProject, PyProjectOptions } from './pyproject';

// https://peps.python.org/pep-0508/
const DEP_NAME_VERSION_REGEX = /^([A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9])(.*)$/;

export class PythonBasicProject extends Project {
  constructor(options: PythonBasicOptions) {
    const optionsWithDefaults = getPythonBasicOptionsWithDefaults(options);
    super({
      ...options,
      name: resolvePackageName(optionsWithDefaults.name, optionsWithDefaults.package),
    });

    // add deps to project
    for (const dep of options.deps ?? []) {
      if (DEP_NAME_VERSION_REGEX.test(dep)) {
        this.addDep(dep);
      } else {
        this.logger.info(`Skipping invalid dep: ${dep}`);
      }
    }
    for (const dep of options.devDeps ?? []) {
      if (DEP_NAME_VERSION_REGEX.test(dep)) {
        this.addDevDep(dep);
      } else {
        this.logger.info(`Skipping invalid devDep: ${dep}`);
      }
    }

    // cleanup default tasks
    this.tasks.removeTask('build');
    this.tasks.removeTask('pre-compile');
    this.tasks.removeTask('post-compile');
    this.tasks.removeTask('compile');
    this.tasks.removeTask('test');
    this.tasks.removeTask('package');

    // create .projenrc.py
    new Projenrc(this, { pythonExec: `${optionsWithDefaults.venvPath}/bin/python` });

    // create LICENSE
    if (options.license) {
      new License(this, options.license);
    }

    // create sample
    if (optionsWithDefaults.sample) {
      new PythonBasicSample(this);
    }

    addDefaultGitIgnore(this);

    // ADD THIS AT LAST BECAUSE DEPS IN project MIGHT BE ADDED BY OTHER COMPONENTS
    // and PyProjectTomlFile will add them to pyproject.toml
    if (optionsWithDefaults.package) {
      // create pyproject.toml and build tasks
      new PyProject(this, optionsWithDefaults);
      // create .python-version
      if (optionsWithDefaults.package.requiresPython) {
        const requiresPython = optionsWithDefaults.package.requiresPython.replace(/[^0-9.]/g, '');
        new PythonVersionFile(this, { pythonVersion: requiresPython });
      }
    }
  }

  /**
   * Add a runtime dependency in format [package-name][==version]
   * E.g: `addDep('package==1.0.0')`
   */
  public addDep(packageNameVersion: string): void {
    this.addDependency(packageNameVersion, DependencyType.RUNTIME);
  }

  /**
   * Add a development dependency in format [package-name][==version]
   */
  public addDevDep(packageNameVersion: string): void {
    this.addDependency(packageNameVersion, DependencyType.DEVENV);
  }

  private addDependency(packageNameVersion: string, type: DependencyType): void {
    // extract package name and version
    const match = DEP_NAME_VERSION_REGEX.exec(packageNameVersion);
    if (!match) {
      throw new Error(`Invalid package name/version: ${packageNameVersion}`);
    }
    const packageName = match[1];
    const versionSpec = match[2];
    this.deps.addDependency(`${packageName}${versionSpec ? '@' : ''}${versionSpec}`, type);
  }
}

export interface PythonBasicOptions extends ProjectOptions, PyProjectOptions {
  /**
   * Package dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly deps?: string[];
  /**
   * Development dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly devDeps?: string[];
  /**
   * License options
   */
  readonly license?: LicenseOptions;
  /**
   * Create sample code and test (if dir doesn't exist yet)
   * @default true
   */
  readonly sample?: boolean;
}

const getPythonBasicOptionsWithDefaults = (options: PythonBasicOptions): PythonBasicOptions => {
  const packageWithDefaults = {
    requiresPython: '>=3.12',
    ...options.package,
  };
  return {
    venvPath: '.venv',
    lockFile: 'constraints.txt',
    lockFileDev: 'constraints-dev.txt',
    pythonExec: 'python',
    ...options,
    package: packageWithDefaults,
    sample: options.sample ?? true,
  };
};
