import { FileBase, IResolver, Project } from 'projen';

/**
 * A managed file whose content is fixed at construction time and written to disk during synthesis.
 * Used internally by FolderSyncConsumer to place synced files into the project workspace.
 */
export class FolderSyncDocument extends FileBase {
  private readonly fileContents: string;

  constructor(project: Project, filePath: string, contents: string) {
    super(project, filePath, { readonly: true, marker: false });
    this.fileContents = contents;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return this.fileContents;
  }
}
