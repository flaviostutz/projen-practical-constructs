import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
// eslint-disable-next-line unicorn/import-style
import { join } from 'node:path';

import { Project } from 'projen';

export class TestProject extends Project {
  constructor() {
    const outdir = mkdtempSync(join(tmpdir(), 'test-'));
    super({ name: 'test', outdir });
  }
}
