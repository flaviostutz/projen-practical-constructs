/* eslint-disable no-restricted-syntax */
/* eslint-disable no-new */

import { DependencyType, Project, ProjectOptions } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { NODE_VERSION, PROJEN_VERSION } from '../common/constants';
import { BaseTooling } from '../common/components/base-tooling';
import { CommonTargetsTasks } from '../common/components/common-targets';
import { ReleaseTasks, ReleaseOptions } from '../common/components/release-tasks';
import { PublishOptions, PublishTasks } from '../common/components/publish/publish-tasks';

import { resolvePackageName } from './files/pyproject-toml';
import { PythonBasicSample } from './components/sample';
import { Build0Options, BuildTarget } from './build';
import { ReadmeFile } from './files';
import { LintTarget, LintOptions } from './lint';
import { TestTarget, TestOptions } from './test';
import { TaskOptionsTarget } from './tasks';
import { TS_NODE_VERSION } from './constants';

// https://peps.python.org/pep-0508/
const DEP_NAME_VERSION_REGEX = /^([\dA-Za-z][\w.-]*[\dA-Za-z])(.*)$/;

/**
 * Python project with basic configurations for linting, testing, building etc
 * @pjid python_basic
 */
export class PythonBasicProject extends Project {
  constructor(options: PythonBasicOptions) {
    const optionsWithDefaults = getPythonBasicOptionsWithDefaults(options);
    super({
      ...options,
      name: resolvePackageName(optionsWithDefaults.name, optionsWithDefaults.pkg),
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

    const venvPath = optionsWithDefaults.venvPath ?? '.venv';

    // create .projenrc.py
    new Projenrc(this, { pythonExec: `${venvPath}/bin/python` });

    // will create tasks such as build, lint, test, release etc
    // based on common-tasks spec
    new CommonTargetsTasks(this, {
      buildEnable: true,
      lintEnable: true,
      testEnable: true,
      releaseEnable: true,
      releaseOpts: {
        action: 'console',
        ...optionsWithDefaults.release,
        preRelease: false,
      },
    });

    // create pre-release task "release:pre"
    new ReleaseTasks(this, {
      action: 'console',
      ...optionsWithDefaults.release,
      preRelease: true,
      name: 'pre',
    });

    new PublishTasks(this, optionsWithDefaults.publish);

    // create README.md
    new ReadmeFile(this, {
      projectName: optionsWithDefaults.name,
      description: optionsWithDefaults.pkg?.description,
    });

    // create sample
    if (optionsWithDefaults.sample) {
      new PythonBasicSample(this);
    }

    // create Makefiles and .nvmrc
    new BaseTooling(this, {
      nodeVersion: NODE_VERSION,
      projenLibVersion: PROJEN_VERSION,
      tsNodeLibVersion: TS_NODE_VERSION,
      additionalMakefileContentsProjen: `prepare-venv:
	npx projen prepare-venv

`,
    });

    // LINT
    new LintTarget(
      this,
      {
        venvPath,
      },
      optionsWithDefaults.lint,
    );

    // TEST
    new TestTarget(
      this,
      {
        venvPath,
      },
      optionsWithDefaults.test,
    );

    // BUILD
    // This should be in the last position because other components might add dependencies
    // and they will be used to generate pyproject.toml, for example
    new BuildTarget(
      this,
      {
        venvPath,
      },
      {
        pip: optionsWithDefaults.pip,
        pkg: optionsWithDefaults.pkg,
      },
    );
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

export interface PythonBasicOptions extends ProjectOptions, Build0Options, TaskOptionsTarget {
  /**
   * Package dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly deps?: string[];
  /**
   * Development dependencies in format `['package==1.0.0', 'package2==2.0.0']`
   */
  readonly devDeps?: string[];
  /**
   * Create sample code and test (if dir doesn't exist yet)
   * @default true
   */
  readonly sample?: boolean;
  /**
   * Linting configurations such as rules selected etc
   * This prepares the project with lint configurations such as rules selected, rules ignored etc
   */
  readonly lint?: LintOptions;
  /**
   * Test configurations
   * This prepares the project with test configurations such as coverage threshold etc
   */
  readonly test?: TestOptions;
  /**
   * Release options for the "release" task.
   * This prepares the project to execute pre-publish actions such as changelog generation, version tagging in git etc
   */
  readonly release?: ReleaseOptions;
  /**
   * Publish options for the "publish" task
   * This prepares the project to be published to a package registry such as pypi or npm
   */
  readonly publish?: PublishOptions;
}

const getPythonBasicOptionsWithDefaults = (options: PythonBasicOptions): PythonBasicOptions => {
  return {
    sample: true,
    ...options,
  };
};
