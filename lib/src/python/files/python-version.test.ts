/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../utils';

import { PythonVersionFile } from './python-version';

describe('PythonVersionFile', () => {
  it('synthesizes .python-version correctly', () => {
    const prj = new TestProject();
    new PythonVersionFile(prj, { pythonVersion: '3.11' });
    const out = Testing.synth(prj);
    expect(out['.python-version']).toMatchSnapshot();
  });
});
