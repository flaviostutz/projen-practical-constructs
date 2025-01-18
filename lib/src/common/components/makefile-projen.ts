/* eslint-disable no-new */
import { Component, Project, SampleFile } from 'projen';

import { NvmRcFile } from '../../nodejs/files/nvmrc';

export class MakefileProjen extends Component {
  constructor(project: Project, opts?: MakefileProjenOptions) {
    super(project);

    const optsWithDefaults: Required<MakefileProjenOptions> = {
      tsNodeLibVersion: '10.9.2',
      projenLibVersion: '0.91.6',
      nodeVersion: '20.16.0',
      additionalContents: '',
      additionalContentsTargets: {},
      ...opts,
    };

    new SampleFile(project, 'Makefile', {
      contents: `all: build lint test

build:
      npx projen build
      ${optsWithDefaults.additionalContentsTargets.build ?? ''}

lint:
      npx projen lint
      ${optsWithDefaults.additionalContentsTargets.lint ?? ''}

lint-fix:
      npx projen lint-fix
      ${optsWithDefaults.additionalContentsTargets['lint-fix'] ?? ''}

test:
      npx projen test
      ${optsWithDefaults.additionalContentsTargets.test ?? ''}

clean:
      npx projen clean
      ${optsWithDefaults.additionalContentsTargets.clean ?? ''}

prepare:
      brew install nvm
      @echo "Configure your shell following the instructions at https://formulae.brew.sh/formula/nvm"
      ${optsWithDefaults.additionalContentsTargets.prepare ?? ''}

prepare-projen:
      npm install --no-save ts-node@${optsWithDefaults.tsNodeLibVersion} projen@${optsWithDefaults.projenLibVersion}

${optsWithDefaults.additionalContents}
`,
    });

    new NvmRcFile(project, {
      nodeVersion: optsWithDefaults.nodeVersion,
    });
  }
}

export interface MakefileProjenOptions {
  /**
   * Additional contents to be added to the Makefile on top of the default projen related targets
   * @default - no additional rules
   */
  readonly additionalContents?: string;
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
  readonly additionalContentsTargets?: Record<string, string>;
}
