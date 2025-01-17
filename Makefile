all: build lint test

build:
	cd lib && make build
	cd example/python && make build

test:
	cd lib && make test
	make test-examples
	make test-integration-examples

lint:
	cd lib && make lint
	cd examples/python make lint

test-examples:
	cd examples/python && make test

test-integration-examples:
	EXAMPLE_PATH=examples/python PROJ_TYPE=python && make run-test-integration

# Creates a brand new project using this project type
# and runs build, lint, test on it to check if 
# everything is working as expected
run-test-integration:
	if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi
	if [ "$$PROJ_TYPE" = "" ]; then \
		echo "PROJ_TYPE env is required"; \
		exit 1; \
	fi

	@echo "\n>>> Delete all files in $$EXAMPLE_PATH..."
	rm -rf $$EXAMPLE_PATH
	mkdir $$EXAMPLE_PATH
	# cd $$EXAMPLE_PATH && find . -type f ! -name 'Makefile' -delete
	# cd $$EXAMPLE_PATH && find . -type d -delete

	@echo "\n>>> Create a brand new example project with type $$PROJ_TYPE"
	cd $$ EXAMPLE_PATH && npx projen new --no-git --from ../../lib/dist/js/projen-python@0.0.0.jsii.tgz $$PROJ_TYPE

	@echo "\n>>> Run build, lint-fix, lint and test on the generated example project"
	cd $$ EXAMPLE_PATH && make build lint-fix lint test


example-update:
	if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi
	@echo "Build projen type lib..."
	cd lib && make build
	@echo "Update the example project..."
	cd $$EXAMPLE_PATH && make prepare-venv build


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
