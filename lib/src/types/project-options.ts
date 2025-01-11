import { LicenseOptions, ProjectOptions } from 'projen';

import { PyProjectTomlOptions } from './package-options';

export interface PythonBasicOptions extends ProjectOptions {
  readonly package?: PyProjectTomlOptions;
  readonly license?: LicenseOptions;
  /**
   * Include sample code and test if the relevant directories don't exist.
   * @default true
   */
  readonly sample?: boolean;
  /**
   * Path to the python executable to use.
   * @default "python"
   */
  readonly pythonExec?: string;
}
