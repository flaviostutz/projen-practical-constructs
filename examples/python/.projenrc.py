from projen_practical_constructs import PythonBasicProject

project = PythonBasicProject(
    dev_deps=["../../lib/dist/js/projen-practical-constructs@0.0.0.jsii.tgz"],
    name="python2",
)

project.synth()