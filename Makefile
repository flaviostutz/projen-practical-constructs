SHELL := /bin/bash

all: build lint test

build: build-lib build-examples

test: test-unit test-integration

build-lib:
	@echo ">>> Build lib..."
	cd lib && make build

build-examples:
	@echo ">>> Build examples..."
	@if [  ! -f "examples/python/Makefile" ]; then \
		make dev-new; \
	fi
	EXAMPLE_PATH="examples/python" make install-examples-local
	cd "examples/python" && make build

test-unit: test-lib test-examples

test-lib:
	@echo ">>> Test lib..."
	cd lib && make test

test-examples:
	@echo ">>> Test examples..."
	cd "examples/python" && make test

test-integration:
	@echo ">>> Integration tests..."
	EXAMPLE_PATH=examples/python PROJ_TYPE=python_basic make run-test-integration

lint:
	@echo ">>> Lint lib..."
	cd lib && make lint
	# @echo ">>> Lint examples..."
	# cd "examples/python" && make lint

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

	@echo ">>> Delete all files in $$EXAMPLE_PATH..."
	rm -rf "$$EXAMPLE_PATH"
	mkdir "$$EXAMPLE_PATH"

	@echo ">>> Create a brand new example project with type '$$PROJ_TYPE'"
	cd "$$EXAMPLE_PATH" && npx projen new --no-git --from ../../lib/dist/js/projen-practical-constructs@0.0.0.jsii.tgz $$PROJ_TYPE

	EXAMPLE_PATH="examples/python" make install-examples-local

	@echo ">>> Run build, lint-fix, lint and test on the generated example project"
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

clean:
	-cd lib && make clean
	-cd examples/python && make clean

install-examples-local:
	@if [ "$$EXAMPLE_PATH" = "" ]; then \
		echo "EXAMPLE_PATH env is required"; \
		exit 1; \
	fi
	@echo "Installing local version of projen-practical-constructs in examples..."
	$$EXAMPLE_PATH/.venv/bin/pip install $$(ls ./lib/dist/python/projen_practical_constructs-*.tar.gz | head -n 1)

prepare:
	brew install python
	brew install pyenv
	@# Node is required for projen runtime
	brew install nvm
	@echo "Configure your shell following instructions at https://formulae.brew.sh/formula/nvm"
	@echo "Then open a shell and run:"
	@echo "nvm use"
	@echo "corepack enable"

