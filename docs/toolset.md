# Development Toolset

The project uses TypeScript as its actual source language. Obviously TypeScript has to be compiled/transpiled to actual JavaScript for releases.

## Toolset

### Compiler

[TypeScript](https://github.com/microsoft/TypeScript), obviously. The provided `tsconfig.json` enforces some strict rules on the codebase to keep quality high.

### Code Formatter

[prettier](https://github.com/prettier/prettier) is used "out of the box" on any file supported by `prettier`. The idea is to just don't care about formatting the source code and instead focus on creating code.

### Linter

[eslint](https://github.com/eslint/eslint) is setup with all necessary means to provide linting for the TypeScript source files. Basically the recommended config is used in its default setup.

### Testing Framework

[jest](https://github.com/facebook/jest) is used as the testing framework. Nothing fancy here.

### Git Hooks

The project relies on [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) to run code formatter and linter on any staged file (incorporating [lint-staged](https://github.com/okonet/lint-staged)).

Just run `npx simple-git-hooks` on your command line to activate the hooks.
