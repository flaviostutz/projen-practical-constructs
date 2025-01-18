/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { MyPyIniFile } from './mypy-ini';

describe('MyPyIniFile', () => {
  test('synthesizes default mypy.ini', () => {
    const project = new TestProject();
    new MyPyIniFile(project);
    const output = Testing.synth(project);
    expect(output['mypy.ini']).toMatchSnapshot();
  });
});
