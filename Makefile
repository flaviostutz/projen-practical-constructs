all:
	@echo "\n>>> Build projen-python lib..."
	make build-lib

	@echo "\n>>> Build, lint test all examples..."
	EXAMPLE_PATH=python make all-example

	@echo "\n>>> Run integration tests..."
	EXAMPLE_PATH=python make test-integration

all-example: check-folder
	cd example/$$EXAMPLE_PATH && make build lint test

build-lib:
	cd lib && make build lint test

# Creates a brand new project using this project type
# and runs build, lint, test on it to check if 
# everything is working as expected
test-integration:
	@echo "\n>>> Create a brand new example project with this type"
	make example-new

	@echo "\n>>> Run build, lint test on the generated example project"
	cd example && make build lint test

	@echo "\n>>> Change something on the example project structure and update it"
	# TODO

	@echo "\n>>> Run build, lint test on the generated example project"
	cd example && make build lint test

example-new:
	@echo "Delete all files in examples dir, except Makefile..."
	cd example && find . -type f ! -name 'Makefile' -delete
	cd example && find . -type d -delete

	@echo "Build the projen type lib..."
	cd lib && make build
	
	@echo "Create a new example project..."
	cd example && npx projen new --no-git --from ../../lib/dist/js/projen-python@0.0.0.jsii.tgz

example-update:
	@echo "Build the projen type lib..."
	cd lib && make build
	@echo "Update the example project..."
	cd example && make prepare-venv	build

check-folder:
	if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi

prepare:
	# Node is required for projen runtime
	brew install nvm
	brew install python
	brew install pyenv
	make prepare-venv
	make prepare-projen

prepare-projen:
	npm install --no-save ts-node@10.9.2 projen@0.91.6

prepare-venv:
	@echo "Installing Python with pyenv (version from .python-version file)..."
	pyenv install -s

	@echo "Preparing Python virtual environment at $(VENV_PATH)..."
	pyenv exec python -m venv $(VENV_PATH)

	@echo "Installing Projen $(PROJEN_VERSION)..."
	$(VENV_PATH)/bin/pip install projen==$(PROJEN_VERSION)

	@echo "Installing local version of projen-python..."
	$(VENV_PATH)/bin/pip install ../lib/dist/python/projen_python-0.0.0.tar.gz 
