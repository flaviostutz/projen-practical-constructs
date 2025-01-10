new:
	@echo "Delete all files in this dir, except Makefile..."
	find . -type f ! -name 'Makefile' -delete
	find . -type d -delete

	@echo "Build the projen type lib..."
	cd ../lib && make build
	
	@echo "Create a new project..."
	npx projen new --no-git --from ../lib/dist/js/projen-python@0.0.0.jsii.tgz

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

clean:
	npx projen clean

all: build test lint

prepare:
	brew install n
	sudo n install auto
	make prepare-projen

prepare-projen:
	npm install --no-save ts-node@10.9.2 projen@0.91.6
