from projen_python import LintOptions, PyProjectTomlOptions, PythonBasicProject, RuffTomlFileOptions, TestOptions

project = PythonBasicProject(
    name="example",
    deps=["helloworld"],
    license="MIT",
    lock_file="requirements.txt",
    lock_file_dev="requirements-dev.txt",
    package=PyProjectTomlOptions(
        author_email="test@test.com",
        description="Example project",
        version="1.0.0",
        dependencies=["pandas"]
    ),
    lint=LintOptions(
        ruff_toml=RuffTomlFileOptions(
            mccabe_max_complexity=20,
            unsafe_fixes=True
        )
    ),
    test=TestOptions(
        min_coverage=50,
        skip_empty=True
    ),
)

project.synth()
