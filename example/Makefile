N = n -q exec auto
build: prepare-projen
	$(N) npx projen
	$(N) npx projen build

.PHONY: test
test: prepare-projen
	$(N) npx projen test

lint: prepare-projen
	$(N) npx projen lint

lint-fix: prepare-projen
	$(N) npx projen lint-fix

clean:
	$(N) npx projen clean

all: build test lint

prepare:
	brew install n
	sudo n install auto
	make prepare-projen

prepare-projen:
	$(N) npm install --no-save ts-node@10.9.2 projen@0.91.5
