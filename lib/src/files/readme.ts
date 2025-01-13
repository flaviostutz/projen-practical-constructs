/* eslint-disable no-new */
import { Component, Project, SampleDir } from 'projen';

export class ReadmeFile extends Component {
  private readonly opts: ReadmeOptions;

  constructor(project: Project, opts: ReadmeOptions) {
    super(project);
    this.opts = opts;

    new SampleDir(project, '.', {
      files: {
        'README.md': contents(this.opts),
      },
    });
  }
}

export interface ReadmeOptions {
  readonly projectName: string;
  readonly description?: string;
}

const contents = (opts: ReadmeOptions): string => `# ${opts.projectName}

${opts.description ?? ''}

This project is managed by [Projen](https://projen.io/docs/introduction/getting-started/). 
For configuring the project, change mainly the .projenrc.py file and run \`make build\`.

## Developer commands

The project follows command standards in [common-targets](https://github.com/flaviostutz/common-targets).
Open a terminal in the root of the project and run the following commands:

\`\`\`
# install tools on developer machine
make prepare

# install, compile, package
make build

# run tests
make test

# lint, audit, format, type check
make lint
\`\`\`

## Tools
- Makefile: scripts management
- pyenv: Python installation
- pip: virtual environment management + package manager
- Mypy: code Type check
- RUFF: code formatting and linting
- pytest + coverage: test management
- pip-audit: dependencies vulnerability checks
- pip-tools: dependencies lock file generation (contrainsts.txt)

All the tools are working correctly with Makefile scripts to be used locally or in CI pipelines and also with VSCode plugins (check .vscode/extensions.json for details) to make the findings more visual.

## References

- Unit tests: https://www.dataquest.io/blog/unit-tests-python/
- Test coverage: https://medium.com/@keployio/mastering-python-test-coverage-tools-tips-and-best-practices-11daf699d79b
- Lint: https://realpython.com/ruff-python/
- Sample structure: https://github.com/pypa/sampleproject
- Dependencies lock: https://github.com/jazzband/pip-tools
`;
