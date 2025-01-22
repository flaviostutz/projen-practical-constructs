build: prepare-projen
	# if we use PNPM the jsii packing freezes
	npx projen
	npx projen install
	npx projen compile
	npx projen package-all

.PHONY: test
test:
	npx projen test

lint:
	npm exec eslint -- ./src --ext .ts
	npm audit --audit-level high

lint-fix: prepare-projen
	npm exec eslint -- ./src --ext .ts --fix

clean:
	rm -rf node_modules dist lib coverage test-reports .jsii

publish-npmjs: prepare-projen
	@if [ "$$NPM_ACCESS_TOKEN" = "" ]; then \
		echo "NPM_ACCESS_TOKEN env is required"; \
		exit 1; \
	fi
	npx projen release
	NPM_TOKEN=$$NPM_ACCESS_TOKEN npx -p publib@latest publib-npm

publish-pypi: prepare-projen
	@if [ "$$PYPI_TOKEN_NAME" = "" ]; then \
		echo "PYPI_TOKEN_NAME env is required"; \
		exit 1; \
	fi
	@if [ "$$PYPI_TOKEN_PASSWORD" = "" ]; then \
		echo "PYPI_TOKEN_PASSWORD env is required"; \
		exit 1; \
	fi
	# when CI is defined, only packages for js are created by release
	CI='' npx projen release
	TWINE_USERNAME="$$PYPI_TOKEN_NAME" TWINE_PASSWORD="$$PYPI_TOKEN_PASSWORD" \
		npx -p publib@latest publib-pypi

all: build test lint

prepare-projen:
	@if [ "$$CI" != "" ]; then \
		set -x; npm install --no-save --no-package-lock ts-node@10.9.2 projen@0.91.6; \
	else \
		set -x; npm install --no-save ts-node@10.9.2 projen@0.91.6; \
	fi
