import { FileBase, IResolver, Project } from 'projen';

export class PyTestIniFile extends FileBase {
  constructor(project: Project) {
    super(project, 'pytest.ini');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `[pytest]
cache_dir = .cache/.pytest_cache
testpaths =
    tests
    integration
`;
  }
}
