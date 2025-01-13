import { FileBase, IResolver, Project } from 'projen';

export class MyPyIniFile extends FileBase {
  constructor(project: Project) {
    super(project, 'mypy.ini');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected synthesizeContent(_resolver: IResolver): string | undefined {
    return `[mypy]
mypy_path = 
    src
    tests
warn_return_any = True
warn_unreachable = True
warn_redundant_casts = True
warn_unused_ignores = True
pretty = True
cache_dir = .cache/.mypy_cache
`;
  }
}
