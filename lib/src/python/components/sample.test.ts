/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { PythonBasicSample } from './sample';

describe('PythonBasicSample', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    new PythonBasicSample(project);
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });
});
