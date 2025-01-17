from projen_python import PythonBasicProject

project = PythonBasicProject(
    dev_deps=["../../lib/dist/js/projen-python@0.0.0.jsii.tgz"],
    name="python",
)

project.synth()