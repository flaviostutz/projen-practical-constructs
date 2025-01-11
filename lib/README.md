# lib

## JSII
  - The options of the constructs have to be "interface", not "types" because they are exposed to JSII and it works well only with interfaces
  - The Project type must have an attribute with name "options" in constructor
  - https://aws.github.io/jsii/specification/2-type-system/

## References
- Projen quick start: https://projen.io/docs/quick-starts/python/hello-world/
- https://projen.io/docs/concepts/projects/building-your-own/
- Sample code for Python contructs: https://github.com/projen/projen/blob/main/src/python/pip.ts
- https://kennethwinner.com/2021/03/07/projen-external-module-github/
- Example project of a Python Projen Type: https://github.com/kcwinner/projen-github-demo
