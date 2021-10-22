// SPDX-License-Identifier: MIT

/* library imports */
import sharp = require("sharp");

/* internal imports */
import { FormatConfig, ImpConfig, TargetConfig } from "./configure";
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

  constructor(inputFile: string, config: ImpConfig) {
    this._inputFile = inputFile;
    this._outputDir = config.outputDir;
    this._targets = config.targets;
    this._formatOptions = config.formatOptions;

    this.__sharpPipeEntry = undefined;
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

      return resolve(sharpPipes);
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

export function processImageList(inputFiles: string[]): Promise<void> {
  return new Promise((resolve, _reject) => {
    inputFiles.forEach((inputFile: string) => {
      logger.debug(inputFile);
    });
    return resolve();
  });
}
