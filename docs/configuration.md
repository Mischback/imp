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

```
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
  },
```

- `formatOptions`:
  - This option **can** be provided by configuration file only.
  - `formatOptions` are directly derived from Sharp, for details, see
    [Sharp's documentation](https://sharp.pixelplumbing.com/api-output).

```
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
  },
```

## Configuration by Command Line
