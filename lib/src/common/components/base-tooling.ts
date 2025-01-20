/* eslint-disable no-new */
import { Component, Project, SampleFile } from 'projen';

import { NvmRcFile } from '../../nodejs/files/nvmrc';
import { MakefileProjenFile, MakefileProjenOptions } from '../files/makefile-projen';
import { NODE_VERSION } from '../constants';

/**
 * Base tooling for projen projects
 * Creates a Makefile-projen file with common targets used in projen projects
 * and a Makefile file that can be edited by devs
 */
export class BaseTooling extends Component {
  constructor(project: Project, opts?: BaseToolingOptions) {
    super(project);

    // Add a Makefile-projen file to the project
    // with common targets for projen projects
    new MakefileProjenFile(project, opts);

    // Add a Makefile to the project that can be edited by devs
    new SampleFile(project, 'Makefile', {
      contents: `SHELL := /bin/bash

## Inherit targets from another Makefile
%:
	make -f Makefile-projen $@

dev-sample:
	@echo "This is a sample target. Edit the Makefile to add your own targets."

`,
    });

    new NvmRcFile(project, {
      nodeVersion: opts?.nodeVersion ?? NODE_VERSION,
    });
  }
}

export interface BaseToolingOptions extends MakefileProjenOptions {
  /**
   * Additional contents to be added to Makefile, which is a sample
   * and can be edited by devs after the initial generation
   */
  additionalMakefileContentsUser?: string;
}
