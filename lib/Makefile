build: prepare-projen
	npx projen
	npx projen install
	npx projen compile
	npx projen package-all

build-release: prepare-projen
	npx projen
	npx projen install	
	# check if tag is current and bump version in package.json to latest tag so jsii packs it correctly
	npx -y monotag@1.26.0 current --bump-action=latest --prefix=
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

	make build-release

	echo "" >> .npmrc
	echo "//registry.npmjs.org/:_authToken=$${NPM_ACCESS_TOKEN}" >> .npmrc
	NPM_TOKEN="$${NPM_ACCESS_TOKEN}" npx -y -p publib@latest publib-npm

publish-pypi: prepare-projen
	@if [ "$$PYPI_TOKEN_PASSWORD" = "" ]; then \
		echo "PYPI_TOKEN_PASSWORD env is required"; \
		exit 1; \
	fi

	make build-release

	TWINE_USERNAME="__token__" TWINE_PASSWORD="$$PYPI_TOKEN_PASSWORD" \
		npx -y -p publib@latest publib-pypi


all: build test lint

prepare-projen:
	@if [ "$$CI" != "" ]; then \
		set -x; npm install --no-save --no-package-lock ts-node@10.9.2 projen@0.91.13; \
	else \
		set -x; npm install --no-save ts-node@10.9.2 projen@0.91.13; \
	fi
