/* eslint-disable no-new */
import { License, Project } from 'projen';
import { Projenrc } from 'projen/lib/python';

import { PythonBasicOptions } from './types/project-options';
import { PyProjectToml, resolvePackageName } from './constructs/pyproject';

export class PythonBasicProject extends Project {
  constructor(options: PythonBasicOptions) {
    super({ ...options, name: resolvePackageName(options.name, options.package) });

    // create .projenrc.py
    new Projenrc(this, {});

    // create pyproject.toml
    new PyProjectToml(this, options.package);

    // create LICENSE
    if (options.license) {
      new License(this, options.license);
    }

    // TODO add py.typed to sample
  }
}
