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
  - This option **must** be provided by configuration file!
  - `targets` specify, what _ImP_ should actually do

```JSON
  /* The top-level key **MUST** be named "targets". */
  "targets": {

    /* The name of the actual target may be choosen freely. */
    "full": {

      /* The mode "do-not-scale" skips resizing the image and just converts
       * into the specified format(s) (see below).
       * This value is REQUIRED
       */
      "mode": "do-not-scale",

      /* A string to be appended to the original filename.
       * This *should* be specified if there is more than one target.
       */
      "filenameSuffix": "",

      /* A list of output formats, specified as strings.
       * Accepted values are dependent on Sharp. As of now, these values are
       * supported:
       * - "avif"
       * - "gif"
       * - "heif"
       * - "jpeg"
       * - "png"
       * - "tiff"
       * - "webp"
       * This value is REQUIRED
       */
      "formats": ["png"]
    },

    "small": {
      /* The mode "keep-aspect" resizes the input image to the specified
       * "width" or "height" while keeping the original aspect.
       */
      "mode": "keep-aspect",

      "filenameSuffix": "-small",
      "formats": ["png"],

      /* While using the mode "keep-aspect", either "width" or "height" **MUST**
       * be specified.
       * The values are used as pixel width.
       * If "width" AND "height" are specified, "width" will be used.
       */
      "width": 200
    },

    /* Another example using "keep-aspect" with specified "height" and a longer
     * list of target "formats".
     */
    "medium": {
      "mode": "keep-aspect",
      "filenameSuffix": "-medium",
      "formats": ["png", "jpeg", "webp"],
      "height": 500
    }
  }
```

- `formatOptions`:
  - This option **can** be provided by configuration file only.
  - `formatOptions` are directly derived from Sharp, please see
    [Sharp's documentation](https://sharp.pixelplumbing.com/api-output) for
    details.

```JSON
  /* The top-level key **MUST** be named "formatOptions". */
  "formatOptions": {
    /* The key of a single option must match the values in "targets.formats".
     */
    "png": {
      /* Names and accepted values of these options are directly derived from
       * Sharp and are just passed on to a Sharp function internally.
       */
      "progression": false,
      "compressionLevel": 9,
      "quality": 100,
      "force": true
    }
  }
```

- `loggingOptions`:
  - This option **can** be provided by configuration file only.
  - Available options are directly derived from tslog, please see
    [tslog's documentation](https://tslog.js.org/#/?id=settings) for details.

```JSON
  /* The top-level key **MUST** be named "loggingOptions". */
  "loggingOptions": {
    /* Names and accepted values of these options are directly derived from
     * tslog and are just passed on to a tslog function internally.
     */
    "name": "testconfig"
  }
```

- `inputFiles`:
  - This option can be provided by configuration file or command line parameters.
  - If specified by configuration file, a list of paths/filenames - provided as
    strings - is expected.
  - Paths will be interpreted as _relative to the current working directory_.
  - If an input file is specified by command line parameter (by using `-i`),
    the value from the configuration file is overwritten.

```JSON
  /* The top-level key **MUST** be named "inputFiles". */
  "inputFiles": [
    "path/to/file/a.png",
    "path/to/file/b.jpg"
  ]
```

- `outputDir`:
  - This option can be provided by configuration file or command line parameters.
  - If specified by configuration file, a path/directory name - provided as
    string - is expected.
  - The path will be interpreted as _relative to the current working directory_.
  - If an output directory is specififed by command line parameter (by using
    `-o`), the value from the configuration file is overwritten.

```JSON
  /* The top-level key **MUST** be named "outputDir". */
  "outputDir": "path/to/output/directory",
```

## Configuration by Command Line

_ImP_ accepts the following command line parameters:

- `--debug`, `-d`: Activate the debug mode; in this mode, cosmiconfig's caching is cleared and additional log messages are emitted;
- `--configFile`, `-c`: Specify another name/location for the configuration file to be used;
- `--inputFile`, `-i`: Specify the name/location of the image to be processed. This option may be specified multiple times;
- `--outputDir`, `-o`: Specify the directory to write the processed images to;
- `--quiet`, `-q`: Suppress all output.

Please note that providing `--inputFile` and `--outputDir` through
command line parameters will overwrite the corresponding parameter in the
configuration file.
