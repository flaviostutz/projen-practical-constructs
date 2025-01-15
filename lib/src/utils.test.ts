import { Testing } from 'projen';

import { TestProject } from './utils';

test('TestProject synthesizes correctly', () => {
  const project = new TestProject();
  const output = Testing.synth(project);
  expect(output).toBeDefined();
});
