# Branching Model

## Schematic

```
  * (development) Merge feature-branch-2 into development
  |\
  | * (feature-branch-2) commit 3
  | * commit 2
  | * commit 1
  | |
* | | (main) Release x.y.z
|\|/
| * Merge feature-branch-1 into development
| |\
| | * (feature-branch-1) commit 4
| | * commit 3
| | * commit 2
| | * commit 1
| |/
|/
* Initial commit
```

## Description

The branching model is loosely based on [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) by Vincent Driessen.

**Idea**: `main` only holds released versions of the project, while all development is performed in dedicated feature branches which are "pull-requested" _(is this even a word?)_ against `development`. Thus, `development` will always hold the most recent code and is the default branch in Github.

## Conventions

### Commits

The repository is set up to provide some tooling regarding the actual code quality, including `prettier` as code formatter and `eslint` as linter. If you use the provided `simple-git-hooks` setup, any code contributions should be fit for purpose.

Regarding the actual commit messages: The project does not enforce a styleguide on commit messages, but I highly recommend to stick to some best practices, as outlined in [this post](https://chris.beams.io/posts/git-commit/) by Chris Beams.

### CI

The respository relies on Github Actions to run the test suite (including coverage gathering) against any pull request. If you do provide new code (features/bugfixes), make sure to provide the respective tests for your code.

## Guides

### Merging Pull Requests

```
$ git checkout -b pr-[number]-[description] development
$ git pull --ff-only [fork/branch]
// review
$ git checkout development
$ git merge --no-ff pr-[number]-[description]
$ git push origin development
```
