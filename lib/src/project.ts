/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */
import { DependencyType, License, LicenseOptions, Project, ProjectOptions } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { PyProjectTomlFile, PyProjectTomlOptions, resolvePackageName } from './files/pyproject';
import { PythonVersionFile } from './files/python-version';
import { addDefaultGitIgnore } from './utils/addDefaultGitIgnore';
import { PythonBasicSample } from './sample';

export class PythonBasicProject extends Project {
  constructor(options: PythonBasicOptions) {
    const optionsWithDefaults = getPythonBasicOptionsWithDefaults(options);
    super({
      ...options,
      name: resolvePackageName(optionsWithDefaults.name, optionsWithDefaults.package),
    });

    // add deps to project
    for (const dep of options.deps ?? []) {
      this.addDep(dep);
    }
    for (const dep of options.devDeps ?? []) {
      this.addDevDep(dep);
    }

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
      // create pyproject.toml
      new PyProjectTomlFile(this, optionsWithDefaults.package);
      // create .python-version
      if (optionsWithDefaults.package.requiresPython) {
        const requiresPython = optionsWithDefaults.package.requiresPython.replace(/[^0-9.]/g, '');
        new PythonVersionFile(this, { pythonVersion: requiresPython });
      }
    }
  }

  public addDep(depVersion: string): void {
    this.deps.addDependency(depVersion, DependencyType.RUNTIME);
  }

  public addDevDep(depVersion: string): void {
    this.deps.addDependency(depVersion, DependencyType.DEVENV);
  }
}

export interface PythonBasicOptions extends ProjectOptions {
  /**
   * Package dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly deps?: string[];
  /**
   * Development dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly devDeps?: string[];
  /**
   * Python package options
   */
  readonly package?: PyProjectTomlOptions;
  /**
   * License options
   */
  readonly license?: LicenseOptions;
  /**
   * Create sample code and test (if dir doesn't exist yet)
   * @default true
   */
  readonly sample?: boolean;
  /**
   * Path to the python virtual environment directory
   * used in this project
   */
  readonly venvPath?: string;
}

const getPythonBasicOptionsWithDefaults = (options: PythonBasicOptions): PythonBasicOptions => {
  const packageWithDefaults = {
    requiresPython: '>=3.12',
    ...options.package,
  };
  return {
    venvPath: '.venv',
    ...options,
    package: packageWithDefaults,
    sample: options.sample ?? true,
  };
};
