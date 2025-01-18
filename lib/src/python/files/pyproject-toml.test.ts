/* eslint-disable no-new */

import { DependencyType, Testing } from 'projen';

import { TestProject } from '../../common/test-project';

import { PyProjectTomlFile } from './pyproject-toml';

describe('pyproject', () => {
  test('invalid package name should fail', () => {
    const project = new TestProject();
    expect(() => new PyProjectTomlFile(project, { packageName: '&^ABC' })).toThrow(
      /Invalid package name/,
    );
  });
  test('invalid version should fail', () => {
    const project = new TestProject();
    expect(() => new PyProjectTomlFile(project, { version: 'AAAA' })).toThrow(
      /Invalid version format/,
    );
  });
  test('valid package name and version', () => {
    const project = new TestProject();
    project.deps.addDependency('helloworld==0.1dev', DependencyType.DEVENV);
    new PyProjectTomlFile(project, { packageName: 'abc', version: '1.0.0' });
    const files = Testing.synth(project);
    expect(files['pyproject.toml']).toMatchSnapshot();
  });
});
