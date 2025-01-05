build:
	npx projen
	npx projen install
	npx projen compile
	npx projen package

.PHONY: test
test:
	npx projen test

lint:
	npx projen eslint

lint-fix:
	npx projen eslint --fix

clean:
	rm -rf node_modules dist lib coverage test-reports .jsii
