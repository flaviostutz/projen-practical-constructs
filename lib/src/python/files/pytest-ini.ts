import { FileBase, IResolver, Project } from 'projen';

export class PyTestIniFile extends FileBase {
  public opts: PyTestIniOptions;

  constructor(project: Project, opts: PyTestIniOptions = {}) {
    super(project, 'pytest.ini');
    const optsWithDefaults = {
      verbose: true,
      ...opts,
    };
    this.opts = optsWithDefaults;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `[pytest]
cache_dir = .cache/.pytest_cache
addopts = --cov=src ${this.opts.verbose ? '--verbose' : ''}
testpaths =
    tests
    integration
`;
  }
}

export interface PyTestIniOptions {
  /**
   * Run pytest with the `--verbose` flag.
   * @default true
   */
  readonly verbose?: boolean;
}
