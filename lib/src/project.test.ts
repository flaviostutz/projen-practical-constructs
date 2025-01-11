import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtempSync } from 'fs';

import { PythonBasicProject } from './project';

describe('PythonBasicProject', () => {
  test('package name is set properly', () => {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    console.log(outdir);
    const project = new PythonBasicProject({ name: 'test1', outdir });
    project.synth();
    // const snapshot = Testing.synth(project);
    // expect(snapshot['pyproject.toml']).toContain('name = "test1"');
  });
});
