# ImP

![npm (scoped)](https://img.shields.io/npm/v/@mischback/imp?style=flat)
[![install size](https://packagephobia.com/badge?p=@mischback/imp)](https://packagephobia.com/result?p=@mischback/imp)

![GitHub package.json version (development)](https://img.shields.io/github/package-json/v/mischback/imp/development?style=flat)
![GitHub branch checks state](https://img.shields.io/github/actions/workflow/status/mischback/imp/ci-default.yml?branch=development&style=flat&logo=github)
[![Coverage Status](https://coveralls.io/repos/github/Mischback/imp/badge.svg)](https://coveralls.io/github/Mischback/imp)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat&logo=prettier)](https://github.com/prettier/prettier)
![GitHub License](https://img.shields.io/github/license/mischback/imp?style=flat)

**ImP** is the abbreviation of _image processor_. Basically it is a wrapper
around the wonderful [Sharp](https://github.com/lovell/sharp) module, providing
an easy to use interface to make Sharp usable in a front-end development
workflow.

## Out of Maintanence

_ImP_ is **out of maintenance** until further notice.

There will be no additional features, and **no bugfixes**. If you're interested
in taking over this project, you may use GitHub to get in touch (e.g. by
posting an issue in this repository).

## Installation

Just install _ImP_ from **npm**:

```bash
npm install --save-dev @mischback/imp
```

Most likely you will want to install it as a development dependency for internal
usage (see below for _Security Considerations_).

## Usage

After installation, _ImP_ is available using the following command:

```bash
npx imp
```

Please note, that a configuration file is required, see below for configuration
options and command line parameters.

A more sophisticated usage example is provided in the
[advanced usage guide](https://github.com/Mischback/imp/blob/development/docs/advanced-usage.md).

## Configuration

_ImP_ is configured by its configuration file and command line parameters.
Providing a configuration file (or the corresponding key in `package.json`) is
mandatory, as the `TargetConfig` and `FormatConfig` can not be specified by
command line.

The in-depth description of the configuration file is provided in
[the configuration guide](https://github.com/Mischback/imp/blob/development/docs/configuration.md).

### Configuration File

_ImP_ uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to
retrieve and read the configuration file.

The following locations are searched:

- key "imp" in `package.json`
- an extensionless "rc file", in YAML or JSON format: `.imprc`
- an "rc file" with extension: `.imprc.json`, `.imprc.yaml`, `.imprc.yml`, `.imprc.js` or `.imprc.cjs`
- a `.config.js` or `.config.cjs` CommonJS module

The listed filenames/locations are checked in the current working directory and
then the search is continued upwards (see [cosmiconfig's README](https://github.com/davidtheclark/cosmiconfig/README.md) for further details).

### Configuration by Command Line

Additionally, _ImP_ accepts the following command line parameters:

- `--debug`, `-d`: Activate the debug mode; in this mode, cosmiconfig's caching is cleared and additional log messages are emitted;
- `--configFile`, `-c`: Specify another name/location for the configuration file to be used;
- `--inputFile`, `-i`: Specify the name/location of the image to be processed. This option may be specified multiple times;
- `--outputDir`, `-o`: Specify the directory to write the processed images to;
- `--quiet`, `-q`: Suppress all output.

Please note that providing `--inputFile` and `--outputDir` through
command line parameters will overwrite the corresponding parameter in the
configuration file.

## Security Considerations

_ImP_ was developed without any special regard to security. It is assumed to be
used in a safe environment, meaning that input and output are under strict of
the user.

You should not expose _ImP_ publicly, at least not without some wrapper that
does perform sanitarization of any user input.

## What about this crazy install size?

_ImP_ is a wrapper around Sharp, which is in fact a very capable interface to
[libvips](https://github.com/libvips/libvips) itsself.

The install size actually reflects the installation of _libvips_.

## Contributing

Issues, pull requests and feature requests are welcome. Just use the project's
[issue tracker](https://github.com/mischback/imp/issues).

_ImP_ is implemented in TypeScript and compiled/transpiled to actual JavaScript
on release.

More details about the internal guidelines regarding code formatting, linting,
testing and releasing are provided in `docs/`.

## License

[MIT](https://choosealicense.com/licenses/MIT)
