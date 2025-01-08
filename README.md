# projen-python

Constructs and utilities for managing Python based projects with Projen enforcing solid build, test and linting structures.

This repo have additional Constructs not present in [official projen repo](https://github.com/projen/projen) such as RUFF, Makefile etc.

The basic stack supported by this project is:
- Makefile: scripts management
- pip: virtual environments management
- Mypy: code Type check
- RUFF: code formatting and linting
- pytest + coverage: test management
- pip-audit: dependencies vulnerability checks
- pip-tools: dependencies lock file generation (contrainsts.txt)
- vs-code plugins: code editor feedback

[This project](https://github.com/flaviostutz/monorepo-spikes/tree/main/shared/python/hello_world_reference) was used as reference for the target project structure created by this projen project type.

## Usage

```sh
npx projen new --from projen-python default
```

The constructs can be used separately to adapt to your specific needs, but you can use the PythonProject construct with a default configuration of the entire stack to easily have a full project structure with build, test and linting capabilities.


## Reference

- Projen quick start: https://projen.io/docs/quick-starts/python/hello-world/
- Sample code for Python contructs: https://github.com/projen/projen/blob/main/src/python/pip.ts
- https://kennethwinner.com/2021/03/07/projen-external-module-github/
- Example project of a Python Projen Type: https://github.com/kcwinner/projen-github-demo

