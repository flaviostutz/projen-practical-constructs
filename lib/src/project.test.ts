import { Testing } from 'projen';

import { PythonBasicProject, PythonBasicOptions } from './project';

describe('PythonBasicProject', () => {
  test('PythonBasicProject synthesizes correctly with minimum configuration', () => {
    const options: PythonBasicOptions = {
      name: 'test-project',
    };
    const project = new PythonBasicProject(options);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });
  test('PythonBasicProject synthesizes correctly with custom dependencies', () => {
    const options: PythonBasicOptions = {
      name: 'test-project',
      deps: ['package1==1.0.0', 'package2==2.0.0'],
      devDeps: ['dev-package1==1.0.0', 'dev-package2==2.0.0'],
    };
    const project = new PythonBasicProject(options);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });

  test('PythonBasicProject synthesizes correctly with custom options', () => {
    const options: PythonBasicOptions = {
      name: 'test-project',
      lint: {
        selectRules: ['rule1', 'rule2'],
        ignoreRules: ['rule3'],
      },
      test: {
        minCoverage: 11,
      },
      package: {
        license: 'MIT',
      },
      pip: {
        lockFile: 'lock.txt',
      },
      sample: false,
    };
    const project = new PythonBasicProject(options);
    const output = Testing.synth(project);
    expect(output).toMatchSnapshot();
  });
});
