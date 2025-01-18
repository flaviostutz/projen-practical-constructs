/* eslint-disable no-new */

import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { PyTestIniFile } from './pytest-ini';

describe('PyTestIniFile', () => {
  it('synthesizes pytest.ini correctly', () => {
    const prj = new TestProject();
    new PyTestIniFile(prj);
    const out = Testing.synth(prj);
    expect(out['pytest.ini']).toMatchSnapshot();
  });
});
