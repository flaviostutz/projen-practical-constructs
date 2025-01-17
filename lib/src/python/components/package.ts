/* eslint-disable no-new */
import { Component, License, Project } from 'projen';

import { PyProjectTomlFile, PyProjectTomlOptions } from '../files';

export class Package extends Component {
  constructor(project: Project, opts?: PackageOptions) {
    super(project);

    // create pyproject.toml
    new PyProjectTomlFile(project, opts);

    // create LICENSE
    if (opts?.license) {
      new License(project, {
        spdx: opts?.license,
        copyrightOwner: opts?.authorName ?? 'Unknown',
      });
    }
  }
}

export interface PackageOptions extends PyProjectTomlOptions {
  /**
   * License name in spdx format. e.g: `MIT`, `Apache-2.0`
   */
  readonly license?: string;
}
