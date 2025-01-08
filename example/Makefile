build: prepare-projen
	npx projen
	npx projen build

.PHONY: test
test: prepare-projen
	npx projen test

lint: prepare-projen
	npx projen lint

lint-fix: prepare-projen
	npx projen lint-fix

new:
	npx projen new --from ../lib/dist/js/projen-python@0.0.0.jsii.tgz

clean:
	npx projen clean

all: build test lint

prepare:
	brew install n
	sudo n install auto
	make prepare-projen

prepare-projen:
	npm install --no-save ts-node@10.9.2 projen@0.91.5
