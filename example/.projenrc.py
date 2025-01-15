from projen_python import LintOptions, PipOptions, PackageOptions, PythonBasicProject, RuffTomlFileOptions, TestOptions

project = PythonBasicProject(
    name="example",
    deps=["helloworld"],
    package=PackageOptions(
        author_email="test@test.com",
        description="Example project",
        version="1.0.0",
        license="MIT",
    ),
    pip=PipOptions(
        lock_file="requirements.txt",
        lock_file_dev="requirements-dev.txt",
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
