/* eslint-disable no-new */
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtempSync } from 'fs';

import { PythonBasicProject } from '../project';

import { PyProjectToml } from './pyproject';

describe('pyproject', () => {
  test('invalid package name should fail', () => {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    const project = new PythonBasicProject({ name: 'test2', outdir });
    new PyProjectToml(project, { packageName: '&^ABC' });
    // expect(() => Testing.synth(project)).toThrow(/Invalid package name/);
    project.synth();
  });
  test('invalid version should fail', () => {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    const project = new PythonBasicProject({ name: 'test3', outdir });
    new PyProjectToml(project, { version: 'AAAA' });
    project.synth();
    // expect(() => Testing.synth(project)).toThrow(/Invalid version format/);
  });
});
