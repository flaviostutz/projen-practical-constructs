build: prepare-projen
	# if we use PNPM the jsii packing freezes
	npx projen
	npx projen install
	npx projen compile
	npx projen package

.PHONY: test
test: prepare-projen
	npx projen test

lint: prepare-projen
	npm exec eslint -- ./src --ext .ts
	npm audit --audit-level high

lint-fix: prepare-projen
	npm exec eslint -- ./src --ext .ts --fix

clean:
	rm -rf node_modules dist lib coverage test-reports .jsii

all: build test lint

prepare:
	brew install nvm
	@echo "Configure your shell following instructions at in https://formulae.brew.sh/formula/nvm"

prepare-projen:
	npm install --no-save ts-node@10.9.2 projen@0.91.5
