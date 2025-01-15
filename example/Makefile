PROJEN_VERSION = 0.91.6
VENV_PATH = .venv


build: prepare-projen prepare-venv
	npx projen
	npx projen build

.PHONY: test
test: prepare-projen
	npx projen test

lint: prepare-projen
	npx projen lint

lint-fix: prepare-projen
	npx projen lint-fix

clean:
	npx projen clean

all: build test lint

prepare:
	# Node is required for projen runtime
	brew install nvm
	brew install python
	brew install pyenv
	make prepare-venv

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
