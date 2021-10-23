// SPDX-License-Identifier: MIT

/* library imports */
import { basename, extname } from "path";
import sharp = require("sharp");

/* internal imports */
import { FormatConfig, ImpConfig, TargetConfig, TargetFormat } from "./configure";
import { ImpError } from "./errors";
import { logger } from "./logging";

/* *** TYPE DEFINITIONS *** */

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

export class SharpRunner {
  _inputFile: string;
  _outputDir: string;
  _targets: TargetConfig;
  _formatOptions: FormatConfig;

  __sharpPipeEntry: sharp.Sharp | undefined;
  _fileBasename: string;

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
        .then(() => {
          return resolve(0);
        })
        .catch((err) => {
          logger.debug(err);
          return reject(
            new SharpRunnerProcessError(
              `Unexpected error while processing ${this._inputFile}`
            )
          );
        });
    });
  }

  _buildPipes(): Promise<sharp.Sharp[]> {
    return new Promise((resolve, _reject) => {
      const sharpPipes: sharp.Sharp[] = [];

      Object.keys(this._targets).forEach((targetKey) => {
        const target = this._targets[targetKey];

        const newFileBasename = target?.filenameSuffix ? this._fileBasename + target?.filenameSuffix : this._fileBasename;

        target?.formats.forEach((targetFormat) => {
          try {
            sharpPipes.push(
              this._createPipe(newFileBasename, targetFormat)
            );
          } catch (err) {
            logger.debug(err);
            logger.warn(`Found an unknown target format: "${targetKey}". Skipping!`);
          }
        });
      });

      logger.debug("Completed building of pipes. Resolving!");
      return resolve(sharpPipes);
    });
  }

  _createPipe(fileBasename: string, targetFormat: TargetFormat): sharp.Sharp {

    const pipe = this._sharpPipeEntry.clone();

    logger.debug(fileBasename);
    logger.debug(targetFormat);

    return pipe;
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

export function processImageList(inputFiles: string[]): Promise<void> {
  return new Promise((resolve, _reject) => {
    inputFiles.forEach((inputFile: string) => {
      logger.debug(inputFile);
    });
    return resolve();
  });
}
