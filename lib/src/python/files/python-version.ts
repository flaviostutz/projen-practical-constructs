import { FileBase, IResolver, Project } from 'projen';

export class PythonVersionFile extends FileBase {
  private readonly opts: PythonVersionOptions;

  constructor(project: Project, opts: PythonVersionOptions) {
    super(project, '.python-version');
    this.opts = opts;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `${this.opts.pythonVersion}`;
  }
}

export interface PythonVersionOptions {
  /**
   * The version of Python to be added to the file
   * @required
   */
  readonly pythonVersion: string;
}
