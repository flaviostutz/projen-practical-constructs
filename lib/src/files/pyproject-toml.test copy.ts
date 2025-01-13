/* eslint-disable no-new */
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtempSync } from 'fs';

import { Testing } from 'projen';

import { PythonBasicProject } from '../project';

import { PyProjectTomlFile } from './pyproject-toml';

describe('pyproject', () => {
  test('invalid package name should fail', () => {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    const project = new PythonBasicProject({ name: 'test2', outdir });
    new PyProjectTomlFile(project, { packageName: '&^ABC' });
    expect(() => Testing.synth(project)).toThrow(/Invalid package name/);
    project.synth();
  });
  test('invalid version should fail', () => {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    const project = new PythonBasicProject({ name: 'test3', outdir });
    new PyProjectTomlFile(project, { version: 'AAAA' });
    project.synth();
    expect(() => Testing.synth(project)).toThrow(/Invalid version format/);
  });
});
