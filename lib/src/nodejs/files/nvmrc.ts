import { FileBase, IResolver, Project } from 'projen';

export class NvmRcFile extends FileBase {
  private readonly opts: NvmRcOptions;

  constructor(project: Project, opts: NvmRcOptions) {
    super(project, '.nvmrc');
    this.opts = opts;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `${this.opts.nodeVersion}`;
  }
}

export interface NvmRcOptions {
  /**
   * The version of Python to be added to the file
   * @required
   */
  readonly nodeVersion: string;
}
