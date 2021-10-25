// SPDX-License-Identifier: MIT

/* library imports */
import { createReadStream } from "fs";
import { basename, extname, join } from "path";
import sharp = require("sharp");

/* internal imports */
import {
  FormatConfig,
  ImpConfig,
  TargetConfig,
  TargetConfigItem,
  TargetFormat,
} from "./configure";
import { ImpError } from "./errors";
import { logger } from "./logging";

/* *** INTERNAL CONSTANTS *** */

export class SharpRunnerError extends ImpError {
  constructor(message: string) {
    super(message);
  }
}

class SharpRunnerProcessError extends SharpRunnerError {
  constructor(message: string) {
    super(message);
  }
}

class SharpRunnerCreatePipeError extends SharpRunnerError {
  constructor(message: string) {
    super(message);
  }
}

class SharpRunnerCreatePipeFormatError extends SharpRunnerCreatePipeError {
  constructor(message: string) {
    super(message);
  }
}

class SharpRunnerCreatePipeModeError extends SharpRunnerCreatePipeError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Provides the actual file extensions for Sharp's accepted output formats.
 *
 * @see TargetFormat
 */
const TargetFormatExtensions: { [index: string]: string } = {
  avif: ".avif",
  gif: ".gif",
  heif: ".heif",
  jpeg: ".jpg",
  jpg: ".jpg",
  png: ".png",
  tiff: ".tiff",
  webp: ".webp",
};

/**
 * This class is the core of the module. It provides all necessary means to
 * process one input file into one or several output files.
 */
export class SharpRunner {
  _inputFile: string;
  _outputDir: string;
  _targets: TargetConfig;
  _formatOptions: FormatConfig;

  __sharpPipeEntry: sharp.Sharp | undefined;
  _fileBasename: string;

  /**
   * Create a new instance of SharpRunner.
   *
   * @param inputFile - Path/filename of the file to process
   * @param config - An instance of ImpConfig
   * @returns - An instance of SharpRunner
   *
   * The constructor will split the provided ImpConfig instance into its parts
   * and setup the internal state of the object.
   */
  constructor(inputFile: string, config: ImpConfig) {
    this._inputFile = inputFile;
    this._outputDir = config.outputDir;
    this._targets = config.targets;
    this._formatOptions = config.formatOptions;

    this.__sharpPipeEntry = undefined;
    this._fileBasename = basename(this._inputFile, extname(this._inputFile));
  }

  /**
   * Trigger the actual processing of the input image.
   *
   * @returns Number of processed pipes = number of created images
   *
   * This is the actual public interface of the class (beside its constructor).
   */
  process(): Promise<number> {
    return new Promise((resolve, reject) => {
      this._buildPipes()
        .then((sharpPipes) => {
          return this._processPipes(sharpPipes);
        })
        .then((numberOfProcessedPipes) => {
          return resolve(numberOfProcessedPipes);
        })
        .catch((err) => {
          if (err instanceof SharpRunnerError) return reject(err);

          logger.debug(err);
          return reject(
            new SharpRunnerProcessError(
              `Unexpected error while processing ${this._inputFile}`
            )
          );
        });
    });
  }

  /**
   * Build the required pipes as specified by targets.
   *
   * @returns - A Promise, resolving to a list of sharp.Sharp instances
   *
   * The actual pipes are built by _createPipe(). This method basically loops
   * through the targets: TargetConfig and pushes every result of _createPipe()
   * into a list of sharpPipes: sharp.Sharp[].
   *
   * @see _createPipe
   * @see TargetConfig
   */
  _buildPipes(): Promise<sharp.Sharp[]> {
    return new Promise((resolve, reject) => {
      const sharpPipes: sharp.Sharp[] = [];

      Object.keys(this._targets).forEach((targetKey) => {
        const target = this._targets[targetKey];

        target?.formats.forEach((targetFormat) => {
          try {
            sharpPipes.push(this._createPipe(target, targetFormat));
          } catch (err) {
            if (err instanceof SharpRunnerCreatePipeFormatError) {
              logger.debug(err);
              logger.warn(
                `Found an unknown target format: "${targetFormat}". Skipping!`
              );
            } else {
              return reject(err);
            }
          }
        });
      });

      logger.debug("Completed building of pipes. Resolving!");
      return resolve(sharpPipes);
    });
  }

  /**
   * Create a single pipe as instance of sharp.Sharp.
   *
   * @param target - An instance of TargetConfigItem
   * @param targetFormat - The format for the output file
   * @returns - An instance of sharp.Sharp
   *
   * @see _buildPipes
   * @see TargetConfigItem
   * @see TargetFormat
   */
  _createPipe(
    target: TargetConfigItem,
    targetFormat: TargetFormat
  ): sharp.Sharp {
    let targetSharpFormat: keyof sharp.FormatEnum;
    if (targetFormat in sharp.format) {
      targetSharpFormat = targetFormat as keyof sharp.FormatEnum;
    } else {
      throw new SharpRunnerCreatePipeFormatError(
        `Unknown target format "${targetFormat}"`
      );
    }

    const fileBasename =
      target?.filenameSuffix !== undefined
        ? this._fileBasename + target?.filenameSuffix
        : this._fileBasename;

    const newFilename = `${fileBasename}${
      TargetFormatExtensions[targetFormat] as string
    }`;

    const targetFormatOptions =
      this._formatOptions[targetFormat] !== undefined
        ? this._formatOptions[targetFormat]
        : {};

    let pipe = this._sharpPipeEntry.clone();

    switch (target.mode) {
      case "do-not-scale":
        break;
      case "keep-aspect":
        if (target.width !== undefined) {
          pipe = pipe.resize({ width: target.width });
        } else if (target.height !== undefined) {
          pipe = pipe.resize({ height: target.height });
        } else
          throw new SharpRunnerCreatePipeModeError(
            'Mode "keep-aspect" requires either "width" or "height" to be specified'
          );
        break;
      default:
        throw new SharpRunnerCreatePipeModeError("Unknown target mode");
    }

    pipe = pipe.toFormat(targetSharpFormat, targetFormatOptions);

    // The following line is ignored from TypeScript's and eslint's checks,
    // because they find, that the Promise is not fully populated. Indeed, it
    // will be fully populated, but TypeScript can not determine this, because
    // the call to "toFormat()" is performed with a variable filetype.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pipe = pipe.toFile(join(this._outputDir, newFilename));

    logger.debug(`Built pipe for "${newFilename}"`);

    return pipe;
  }

  /**
   * Process the pipes by piping the input file into the prepared pipes.
   *
   * @param sharpPipes - A list of sharp.Sharp instances to process
   * @returns - A Promise, resolving to the number of processed pipes / created
   *            output files
   *
   * @see _buildPipes
   * @see _createPipe
   */
  _processPipes(sharpPipes: sharp.Sharp[]): Promise<number> {
    return new Promise((resolve, reject) => {
      if (sharpPipes.length === 0) {
        logger.warn("There are no pipes to process. Aborting!");
        return reject(new SharpRunnerProcessError("No pipes to process"));
      }

      const stream = createReadStream(this._inputFile);

      stream.on("open", () => {
        logger.debug(`Piping "${this._inputFile}" into the sharp pipes...`);
        stream.pipe(this._sharpPipeEntry);
      });

      stream.on("error", (err) => {
        logger.debug(err);
        return reject(
          new SharpRunnerProcessError(
            `Error while reading "${this._inputFile}"`
          )
        );
      });

      Promise.all(sharpPipes)
        .then(() => {
          logger.debug("Completed processing all pipes. Resolving!");
          return resolve(sharpPipes.length);
        })
        .catch((err) => {
          logger.debug(err);
          return reject(
            new SharpRunnerProcessError("Error while processing the pipes")
          );
        });
    });
  }

  /**
   * Get this instance's entry point of the Sharp-based processing pipes.
   *
   * @returns sharp.Sharp instance
   *
   * Basically this implements a singleton pattern to ensure that there is one
   * and only one entry point for sharp's processing.
   *
   * This is an internal implementation detail and not part of the public
   * interface of this class!
   */
  get _sharpPipeEntry() {
    if (this.__sharpPipeEntry === undefined) {
      this.__sharpPipeEntry = sharp({ failOnError: true });
    }

    return this.__sharpPipeEntry;
  }
}

/**
 * Process a list of input files by creating instances of SharpRunner.
 *
 * @param configObject - An instance of ImpConfig
 * @returns - A Promise, resolving to the total number of processed pipes
 *
 * @see SharpRunner
 * @see ImpConfig
 */
export function processImageList(configObject: ImpConfig): Promise<number> {
  return new Promise((resolve, reject) => {
    const imageList: Promise<number>[] = [];

    configObject.inputFiles.forEach((inputFile: string) => {
      imageList.push(new SharpRunner(inputFile, configObject).process());
    });

    Promise.all(imageList)
      .then((retVals) => {
        logger.debug(retVals);
        return resolve(retVals.reduce((a, b) => a + b, 0));
      })
      .catch((err) => {
        return reject(err);
      });
  });
}
