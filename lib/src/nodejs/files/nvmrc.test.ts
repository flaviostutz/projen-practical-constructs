/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { NvmRcFile } from './nvmrc';

describe('NvmRcFile', () => {
  it('synthesizes .nvmrc correctly', () => {
    const prj = new TestProject();
    new NvmRcFile(prj, { nodeVersion: '20.16.0' });
    const out = Testing.synth(prj);
    expect(out['.nvmrc']).toMatchSnapshot();
  });
});
