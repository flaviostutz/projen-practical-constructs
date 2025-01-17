import { FileBase, IResolver, Project } from 'projen';

export class CoveragercFile extends FileBase {
  private readonly opts: Required<CoveragercFileOptions>;

  constructor(project: Project, opts?: CoveragercFileOptions) {
    super(project, '.coveragerc');
    this.opts = getOptionsWithDefaults(opts);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `[run]
branch = true
omit = 
  ${this.opts.omitPatterns?.join('\n  ')}

[report]
fail_under = ${this.opts.minCoverage}
format = ${this.opts.format}
skip_empty = ${this.opts.skipEmpty}
skip_covered = ${this.opts.skipCovered}`;
  }
}

const getOptionsWithDefaults = (opts?: CoveragercFileOptions): Required<CoveragercFileOptions> => {
  return {
    minCoverage: 80,
    omitPatterns: [],
    skipCovered: false,
    skipEmpty: true,
    format: 'text',
    ...opts,
  };
};

export interface CoveragercFileOptions {
  /**
   * Minimum coverage required to pass the test.
   * @default 80
   */
  readonly minCoverage?: number;
  /**
   * List of file patterns to omit from coverage
   * @default []
   */
  readonly omitPatterns?: string[];
  /**
   * Skip reporting files that are covered
   * @default false
   */
  readonly skipCovered?: boolean;
  /**
   * Skip reporting files that are empty
   * @default true
   */
  readonly skipEmpty?: boolean;
  /**
   * Coverage report format
   * @default 'text'
   */
  readonly format?: 'text' | 'total' | 'markdown';
}
