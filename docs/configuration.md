# Configure ImP

## Configuration File

### File Location

The following locations are searched:

- key "imp" in `package.json`
- an extensionless "rc file", in YAML or JSON format: `.imprc`
- an "rc file" with extension: `.imprc.json`, `.imprc.yaml`, `.imprc.yml`, `.imprc.js` or `.imprc.cjs`
- a `.config.js` or `.config.cjs` CommonJS module

The listed filenames/locations are checked in the current working directory and
then the search is continued upwards (see [cosmiconfig's README](https://github.com/davidtheclark/cosmiconfig/README.md) for further details).

### Configuration Options

- `targets`:
  - This option **must** be provided by configuration file**!**

## Configuration by Command Line
