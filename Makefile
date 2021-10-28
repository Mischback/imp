# Makefile to support development of a TypeScript-based NodeJS module
#
# This Makefile provides actual build recipes as well as shortcuts for common
# tasks during development, like running the test suite.

# ### CONFIGURATION

# The directory containing the source files
SRC_DIR := src

# make's internal directory to store stamps.
# Stamps are used to keep track of operations, that do not produce a single
# file.
MAKE_STAMP_DIR := .make-stamps


# ### INTERNAL

# Define some required stamps
STAMP_GIT_HOOKS := $(MAKE_STAMP_DIR)/git-hooks
STAMP_NODE_INSTALL := $(MAKE_STAMP_DIR)/node-install
STAMP_TS_COMPILED := $(MAKE_STAMP_DIR)/ts-compiled

# Create a list of source files
SRC_FILES := $(shell find $(SRC_DIR) -type f -not -name *.spec.ts)

# Utility function to create required directories on the fly
create_dir = @mkdir -p $(@D)

# Some make settings
.SILENT:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# Just a shortcut to compile the sources for development
build : dev/build
.PHONY : build

# Run the test suite and collect coverage information.
# See .jestrc.ci.json! This Jest configuration is used exclusively in a CI
# environment.
# Please note that this recipe does not define any prerequisites. The project's
# CI configuration must take care of any prerequisites, i.e. by installing all
# required packages.
# As of now, you may refer to .github/workflows/node_ci.yml
ci/coverage :
	npx jest --config .jestrc.ci.json
.PHONY : ci/coverage

ci/linting :
	npx eslint "**/*.ts"
.PHONY : ci/linting

# Build the project
dev/build : dev/compile
.PHONY : dev/build

# Compile source *.ts files to *.js
dev/compile : $(STAMP_TS_COMPILED)
.PHONY : dev/compile

# Run the test suite and report coverage information.
dev/coverage : | $(STAMP_NODE_INSTALL)
	npx jest --config .jestrc.json --coverage
.PHONY : dev/coverage

# Run the test suite.
dev/test : | $(STAMP_NODE_INSTALL)
	npx jest --config .jestrc.json --verbose
.PHONY : dev/test

# Run eslint against all files in the current directory.
lint/eslint : | $(STAMP_NODE_INSTALL)
	npx eslint --fix "**/*.ts"

# Run prettier against all files in the current directory.
lint/prettier : | $(STAMP_NODE_INSTALL)
	npx prettier . --ignore-unknown --write
.PHONY : lint/prettier

# Apply/update the git hooks
util/githooks : $(STAMP_GIT_HOOKS)
.PHONY : util/githooks

# Provide a pre-configured tree command for convenience
tree :
	tree -a -I ".make-stamps|.git|node_modules" --dirsfirst -c
.PHONY : tree


# Actually execute simple-git-hooks' cli script to apply the configured hooks
$(STAMP_GIT_HOOKS) : .simple-git-hooks.json | $(STAMP_NODE_INSTALL)
	$(create_dir)
	npx simple-git-hooks
	touch $@

# Install all required NodeJS packages as specified in package.json.
# This is applied as an "order-only" prerequisite to all recipes, that rely on
# NodeJS-based commands.
$(STAMP_NODE_INSTALL) : package.json
	$(create_dir)
	npm install
	touch $@

$(STAMP_TS_COMPILED) : $(SRC_FILES) | $(STAMP_NODE_INSTALL)
	$(create_dir)
	npx tsc
	touch $@
