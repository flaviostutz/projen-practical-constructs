/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */

import { DependencyType, License, Project, ProjectOptions } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { resolvePackageName } from './files/pyproject-toml';
import { PythonBasicSample } from './components/sample';
import { BuildTarget, BuildOptions } from './build';
import { ReadmeFile } from './files';
import { LintTarget, LintOptions } from './lint';
import { TestTarget, TestOptions } from './test';

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
    cleanupTasks(this);

    // create .projenrc.py
    new Projenrc(this, { pythonExec: `${optionsWithDefaults.venvPath}/bin/python` });

    // create README.md
    new ReadmeFile(this, {
      projectName: optionsWithDefaults.name,
      description: optionsWithDefaults.package?.description,
    });

    // create LICENSE
    if (options.license) {
      new License(this, { spdx: options.license });
    }

    // create sample
    if (optionsWithDefaults.sample) {
      new PythonBasicSample(this);
    }

    // LINT
    new LintTarget(this, {
      venvPath: optionsWithDefaults.venvPath,
      ...optionsWithDefaults.lint,
      attachTasksTo: 'lint',
    });

    // TEST
    new TestTarget(this, {
      venvPath: optionsWithDefaults.venvPath,
      ...optionsWithDefaults.test,
      attachTasksTo: 'test',
    });

    // BUILD
    // This should be in the last position because other components might add dependencies
    // and they will be used to generate pyproject.toml, for example
    new BuildTarget(this, { ...optionsWithDefaults, attachTasksTo: 'build' });
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

export interface PythonBasicOptions extends ProjectOptions, BuildOptions {
  /**
   * Package dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly deps?: string[];
  /**
   * Development dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly devDeps?: string[];
  /**
   * License name in spdx format. e.g: `MIT`, `Apache-2.0`
   */
  readonly license?: string;
  /**
   * Create sample code and test (if dir doesn't exist yet)
   * @default true
   */
  readonly sample?: boolean;
  /**
   * Linting configurations such as rules selected etc
   */
  readonly lint?: LintOptions;
  /**
   * Test configurations
   */
  readonly test?: TestOptions;
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

const cleanupTasks = (project: Project): void => {
  // cleanup default tasks
  project.tasks.removeTask('build');
  project.tasks.removeTask('pre-compile');
  project.tasks.removeTask('post-compile');
  project.tasks.removeTask('compile');
  project.tasks.removeTask('test');
  project.tasks.removeTask('package');
};
