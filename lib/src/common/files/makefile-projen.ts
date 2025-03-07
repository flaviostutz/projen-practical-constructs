/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { FileBase, IResolver, Project } from 'projen';

import { TS_NODE_VERSION } from '../../python/constants';
import { NODE_VERSION, PROJEN_VERSION } from '../constants';

export class MakefileProjenFile extends FileBase {
  private readonly optsWithDefaults: Required<MakefileProjenOptions>;

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
    // eslint-disable-next-line functional/no-let
    let contents = `SHELL := /bin/bash

all: build lint test

prepare:
	brew install nvm
	@echo "Configure your shell following the instructions at https://formulae.brew.sh/formula/nvm"
  ${targetContents(this.optsWithDefaults.additionalMakefileContentsTargets.prepare)}

prepare-projen:
	@if [ "$$CI" == "true" ]; then \
		set -x; npm install --no-save --no-package-lock ts-node@${this.optsWithDefaults.tsNodeLibVersion} projen@${this.optsWithDefaults.projenLibVersion}; \
	else \
		set -x; npm install --no-save ts-node@${this.optsWithDefaults.tsNodeLibVersion} projen@${this.optsWithDefaults.projenLibVersion}; \
	fi

`;

    for (const task of this.project.tasks.all) {
      if (task.name === 'default') {
        continue;
      }
      // replace only the first colon with a dash
      const taskName = task.name.replace(':', '-');
      if (taskName.includes(':')) {
        // multiple task level found. skip it so Makefile has only the root level tasks
        continue;
      }
      const additional =
        targetContents(this.optsWithDefaults.additionalMakefileContentsTargets[task.name]) ?? '';
      contents += `# ${task.description}
${taskName}:
	npx projen ${task.name}${additional}

`;
    }
    return contents;
  }
}

const targetContents = (contents?: string): string => {
  if (!contents) return '';
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
   * @default '0.91.13'
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
