all:
	@echo "\n>>> Build projen-python lib"
	cd lib && make build lint test
	cd example && make build lint test
	make test-integration

# Creates a brand new project using this project type
# and runs build, lint, test on it to check if 
# everything is working as expected
test-integration:
	@echo "\n>>> Create a brand new example project with this type"
	make example-new

	@echo "\n>>> Run build, lint test on the generated example project"
	cd example && make build lint test

	@echo "\n>>> Change something on the example project structure and update it"
	# TODO

	@echo "\n>>> Run build, lint test on the generated example project"
	cd example && make build lint test

example-new:
	@echo "Delete all files in examples dir, except Makefile..."
	cd example && find . -type f ! -name 'Makefile' -delete
	cd example && find . -type d -delete

	@echo "Build the projen type lib..."
	cd lib && make build
	
	@echo "Create a new example project..."
	cd example && npx projen new --no-git --from ../lib/dist/js/projen-python@0.0.0.jsii.tgz

example-update:
	@echo "Build the projen type lib..."
	cd lib && make build
	@echo "Update the example project..."
	cd example && make prepare-venv	build
