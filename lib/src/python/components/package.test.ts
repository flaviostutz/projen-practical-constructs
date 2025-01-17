/* eslint-disable no-new */
import { Testing } from 'projen';

import { TestProject } from '../utils';

import { Package } from './package';

describe('Package', () => {
  test('snapshot of default options', () => {
    const project = new TestProject();
    new Package(project);
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
  });

  test('snapshot with custom input', () => {
    const project = new TestProject();
    new Package(project, {
      packageName: 'custom-package',
      version: '1.2.3',
      description: 'A custom package',
      authorName: 'John Doe',
      authorEmail: 'john.doe@example.com',
      license: 'MIT',
      keywords: ['custom', 'package', 'example'],
    });
    const out = Testing.synth(project);
    expect(out).toMatchSnapshot();
    expect(project.tasks.all.filter((t) => t.name === 'package').length).toBe(1);
  });
});
