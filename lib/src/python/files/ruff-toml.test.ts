/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { RuffTomlFile } from './ruff-toml';

describe('RuffTomlFile', () => {
  it('synthesizes ruff.toml with default options', () => {
    const prj = new TestProject();
    new RuffTomlFile(prj, {
      /* ...test options... */
    });
    const out = Testing.synth(prj);
    expect(out['ruff.toml']).toMatchSnapshot();
  });

  it('synthesizes ruff.toml with custom options', () => {
    const prj = new TestProject();
    new RuffTomlFile(prj, {
      targetPythonVersion: 'py310',
      unsafeFixes: true,
      mccabeMaxComplexity: 10,
      ignoreRules: ['E501'],
      selectRules: ['F401'],
      perFileIgnores: {
        'src/*': ['E302'],
      },
    });
    const out = Testing.synth(prj);
    expect(out['ruff.toml']).toMatchSnapshot();
  });
});
