build:
	npm install --no-save ts-node
	npx projen
	npx projen install
	npx projen compile
	npx projen package

.PHONY: test
test:
	npx projen test

lint:
	npm exec eslint -- ./src --ext .ts
	npm audit --audit-level high

lint-fix:
	npm exec eslint -- ./src --ext .ts --fix

clean:
	rm -rf node_modules dist lib coverage test-reports .jsii
