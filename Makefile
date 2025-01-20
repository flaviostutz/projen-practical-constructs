SHELL := /bin/bash
VENV_PATH := .venv
PROJEN_VERSION := 0.91.6

all: build lint test

build: build-lib build-examples

test: test-unit test-integration

build-lib:
	cd lib && make build

build-examples:
	cd examples/python && make build

test-unit: test-lib test-examples

test-lib:
	cd lib && make test

test-examples:
	cd examples/python && make test

test-integration:
	EXAMPLE_PATH=examples/python PROJ_TYPE=python_basic make run-test-integration

lint:
	cd lib && make lint
	cd examples/python make lint

# Creates a brand new project using this project type
# and runs build, lint, test on it to check if 
# everything is working as expected
run-test-integration:
	@if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi
	@if [ "$$PROJ_TYPE" = "" ]; then \
		echo "PROJ_TYPE env is required"; \
		exit 1; \
	fi

	@echo "\n>>> Delete all files in $$EXAMPLE_PATH..."
	rm -rf "$$EXAMPLE_PATH"
	mkdir "$$EXAMPLE_PATH"

	@echo "\n>>> Create a brand new example project with type '$$PROJ_TYPE'"
	cd "$$EXAMPLE_PATH" && npx projen new --no-git --from ../../lib/dist/js/projen-python@0.0.0.jsii.tgz $$PROJ_TYPE

	@echo "\n>>> Run build, lint-fix, lint and test on the generated example project"
	cd "$$EXAMPLE_PATH" && make build lint-fix lint test


example-update:
	if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi
	@echo "Build projen type lib..."
	cd lib && make build
	@echo "Update the example project..."
	cd "$$EXAMPLE_PATH" && make prepare-venv build

dev-new:
	make build-lib
	EXAMPLE_PATH=examples/python PROJ_TYPE=python_basic make run-test-integration

prepare:
	# Node is required for projen runtime
	brew install nvm
	brew install python
	brew install pyenv
	make prepare-venv
	make prepare-projen

prepare-projen:
	@if [ "$$CI" != "" ]; then \
		set -x; npm install --no-save --no-package-lock ts-node@10.9.2 projen@0.91.6; \
	else \
		set -x; npm install --no-save ts-node@10.9.2 projen@0.91.6; \
	fi

prepare-venv:
	@echo "Installing Python with pyenv (version from .python-version file)..."
	pyenv install -s

	@echo "Preparing Python virtual environment at $(VENV_PATH)..."
	pyenv exec python -m venv $(VENV_PATH)

	@echo "Installing Projen $(PROJEN_VERSION)..."
	$(VENV_PATH)/bin/pip install projen==$(PROJEN_VERSION)

	@echo "Installing local version of projen-python..."
	$(VENV_PATH)/bin/pip install ../lib/dist/python/projen_python-0.0.0.tar.gz 
