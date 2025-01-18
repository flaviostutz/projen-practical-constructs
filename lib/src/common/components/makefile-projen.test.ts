/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../test-project';

import { MakefileProjen } from './makefile-projen';

test('default Makefile for projen projects', () => {
  const project = new TestProject();
  new MakefileProjen(project);
  const output = Testing.synth(project);
  expect(output).toMatchSnapshot();
});
