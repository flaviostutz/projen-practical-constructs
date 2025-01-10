/* eslint-disable no-new */
import { InitProject, License, LicenseOptions, Project, ProjectOptions } from 'projen';

// import { PythonBasicOptions } from './types/project-options';
// import { PyProjectToml } from './constructs/package';

export interface Opts extends ProjectOptions, InitProject {
  readonly packageName: string;
  readonly license: LicenseOptions;
}

export class PythonBasicProject extends Project {
  constructor(opts: Opts) {
    super(opts);

    // new PyProjectToml(this, opts);
    new License(this, opts.license);
  }
}
