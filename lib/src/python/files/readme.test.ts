/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { ReadmeFile } from './readme';

describe('ReadmeFile', () => {
  it('synthesizes README.md correctly', () => {
    const prj = new TestProject();
    new ReadmeFile(prj, {
      projectName: 'test-project',
      description: 'A test project',
    });
    const out = Testing.synth(prj);
    expect(out['README.md']).toMatchSnapshot();
  });
});
