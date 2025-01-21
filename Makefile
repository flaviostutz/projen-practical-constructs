SHELL := /bin/bash

all: build lint test

build: build-lib build-examples

test: test-unit test-integration

build-lib:
	@echo "\n>>> Build lib..."
	cd lib && make build

build-examples:
	@echo "\n>>> Build examples..."
	@if [  ! -f "examples/python/Makefile" ]; then \
		make dev-new; \
	fi
	cd "examples/python" && make build
	make install-examples-local

test-unit: test-lib test-examples

test-lib:
	@echo "\n>>> Test lib..."
	cd lib && make test

test-examples:
	@echo "\n>>> Test examples..."
	cd "examples/python" && make test

test-integration:
	@echo "\n>>> Integration tests..."
	EXAMPLE_PATH=examples/python PROJ_TYPE=python_basic make run-test-integration

lint:
	@echo "\n>>> Lint lib..."
	cd lib && make lint
	@echo "\n>>> Lint examples..."
	cd "examples/python" && make lint

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
	cd "$$EXAMPLE_PATH" && npx projen new --no-git --from ../../lib/dist/js/projen-practical-constructs@0.0.0.jsii.tgz $$PROJ_TYPE

	@echo "\n>>> Run build, lint-fix, lint and test on the generated example project"
	cd "$$EXAMPLE_PATH" && make build lint-fix lint test

publish-npmjs:
	cd lib && make publish-npmjs

publish-pypi:
	cd lib && make publish-pypi

example-update: install-examples-local
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

clean:
	cd lib && make clean
	cd examples/python && make clean

install-examples-local:
	@echo "Installing local version of projen-practical-constructs in examples..."
	examples/python/.venv/bin/pip install $$(ls ./lib/dist/python/projen_practical_constructs-*.tar.gz | head -n 1)
