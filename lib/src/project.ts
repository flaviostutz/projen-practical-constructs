/* eslint-disable no-new */
import { License, LicenseOptions, Project, ProjectOptions } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { PyProjectTomlFile, PyProjectTomlOptions, resolvePackageName } from './files/pyproject';
import { PythonVersionFile } from './files/python-version';
import { addDefaultGitIgnore } from './utils/addDefaultGitIgnore';

export class PythonBasicProject extends Project {
  constructor(options: PythonBasicOptions) {
    const optionsWithDefaults = getPythonBasicOptionsWithDefaults(options);
    super({
      ...options,
      name: resolvePackageName(optionsWithDefaults.name, optionsWithDefaults.package),
    });

    // create .projenrc.py
    new Projenrc(this, { pythonExec: `${optionsWithDefaults.venvPath}/bin/python` });

    if (optionsWithDefaults.package) {
      // create pyproject.toml
      new PyProjectTomlFile(this, optionsWithDefaults.package);
      // create .python-version
      if (optionsWithDefaults.package.requiresPython) {
        const requiresPython = optionsWithDefaults.package.requiresPython.replace(/[^0-9.]/g, '');
        new PythonVersionFile(this, { pythonVersion: requiresPython });
      }
    }

    // create LICENSE
    if (options.license) {
      new License(this, options.license);
    }

    addDefaultGitIgnore(this);

    // TODO add py.typed to sample
  }
}

export interface PythonBasicOptions extends ProjectOptions {
  readonly package?: PyProjectTomlOptions;
  readonly license?: LicenseOptions;
  /**
   * Include sample code and test if the relevant directories don't exist.
   * @default true
   */
  readonly sample?: boolean;
  /**
   * The path to the python virtual environment directory
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
  };
};
