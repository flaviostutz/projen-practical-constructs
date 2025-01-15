/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../utils';

import { CoveragercFile } from './coveragerc';

describe('CoveragercFile', () => {
  test('synthesizes default coveragerc', () => {
    const project = new TestProject();
    new CoveragercFile(project);
    const output = Testing.synth(project);
    expect(output['.coveragerc']).toMatchSnapshot();
  });

  test('synthesizes custom coveragerc', () => {
    const project = new TestProject();
    new CoveragercFile(project, {
      minCoverage: 90,
      omitPatterns: ['**/test/**'],
      skipCovered: true,
      skipEmpty: false,
      format: 'markdown',
    });
    const output = Testing.synth(project);
    expect(output['.coveragerc']).toMatchSnapshot();
  });
});
