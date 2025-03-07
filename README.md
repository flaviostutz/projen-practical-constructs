# projen-practical-constructs

Constructs and utilities for managing projects with Projen enforcing solid build, test and linting structures.

This repo have additional Constructs not present in [official projen repo](https://github.com/projen/projen) such as RUFF, Makefile etc.

Currently there is support for Python projects, but in the future more will be added.

Check in /examples folder the target structure that these project types will produce.

## For Python project types

Project type name: python_basic

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
npx projen new --from projen-practical-constructs python_basic
```

The constructs can be used separately to adapt to your specific needs, but you can use the PythonProject construct with a default configuration of the entire stack to easily have a full project structure with build, test and linting capabilities.



