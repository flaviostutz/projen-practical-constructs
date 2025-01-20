import { FileBase, IResolver, Project } from 'projen';

import { TS_NODE_VERSION } from '../../python/constants';
import { NODE_VERSION, PROJEN_VERSION } from '../constants';

export class MakefileProjenFile extends FileBase {
  optsWithDefaults: Required<MakefileProjenOptions>;

  constructor(project: Project, opts?: MakefileProjenOptions) {
    super(project, 'Makefile-projen');

    this.optsWithDefaults = {
      tsNodeLibVersion: TS_NODE_VERSION,
      projenLibVersion: PROJEN_VERSION,
      nodeVersion: NODE_VERSION,
      additionalMakefileContentsProjen: '',
      additionalMakefileContentsTargets: {},
      ...opts,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `SHELL := /bin/bash

all: build lint test

build:
	npx projen build${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.build)}

lint:
	npx projen lint${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.lint)}

lint-fix:
	npx projen lint-fix${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets['lint-fix'])}

test:
	npx projen test${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.test)}

clean:
	npx projen clean${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.clean)}

prepare:
	brew install nvm
	@echo "Configure your shell following the instructions at https://formulae.brew.sh/formula/nvm"${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.prepare ?? '')}

prepare-projen:
	@if [ "$$CI" == "true" ]; then \
		set -x; npm install --no-save --no-package-lock ts-node@${this.optsWithDefaults.tsNodeLibVersion} projen@${this.optsWithDefaults.projenLibVersion}; \
	else \
		set -x; npm install --no-save ts-node@${this.optsWithDefaults.tsNodeLibVersion} projen@${this.optsWithDefaults.projenLibVersion}; \
	fi

${this.optsWithDefaults.additionalMakefileContentsProjen ?? ''}
`;
  }
}

const targetContents = (contents?: string): string => {
  // add spaces to each line
  const contentWithSpaces = contents?.replace(/\n/g, '\n	');
  return contentWithSpaces ? `\n	${contentWithSpaces}` : '';
};

export interface MakefileProjenOptions {
  /**
   * Additional contents to be added to the Makefile on top of the default projen related targets
   * @default - no additional rules
   */
  readonly additionalMakefileContentsProjen?: string;
  /**
   * The version of ts-node lib to be used in "prepare" target of the Makefile
   * to install tooling for Projen to work
   * @default '10.9.2'
   */
  readonly tsNodeLibVersion?: string;
  /**
   * The version of projen lib to be used in "prepare" target of the Makefile
   * to install tooling for Projen to work
   * @default '0.91.6'
   */
  readonly projenLibVersion?: string;
  /**
   * Node version to be added to the .nvmrc file
   * @default '20.16.0'
   */
  readonly nodeVersion?: string;
  /**
   * Additional contents to be added to each target of the Makefile
   */
  readonly additionalMakefileContentsTargets?: Record<string, string>;
}
