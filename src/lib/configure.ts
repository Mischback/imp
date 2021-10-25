// SPDX-License-Identifier: MIT

/* library imports */
import { cosmiconfig } from "cosmiconfig";
import { CosmiconfigResult } from "cosmiconfig/dist/types";
import { getopt } from "stdio";
import { Config, GetoptResponse } from "stdio/dist/getopt";
import type {
  AvifOptions,
  GifOptions,
  HeifOptions,
  JpegOptions,
  PngOptions,
  TiffOptions,
  WebpOptions,
  OutputOptions,
} from "sharp";

/* internal imports */
import { ImpError } from "./errors";
import { logger } from "./logging";

/* *** TYPE DEFINITIONS *** */

export type TargetFormat =
  | "avif"
  | "gif"
  | "heif"
  | "jpeg"
  | "png"
  | "tiff"
  | "webp";

interface TargetItemDoNotScale {
  mode: "do-not-scale";
  filenameSuffix: string;
  formats: TargetFormat[];
}

interface TargetItemKeepAspect {
  mode: "keep-aspect";
  filenameSuffix: string;
  formats: TargetFormat[];
  width: number;
}

interface TargetItemKeepAspect {
  mode: "keep-aspect";
  filenameSuffix: string;
  formats: TargetFormat[];
  height: number;
}

export type TargetConfigItem = TargetItemDoNotScale | TargetItemKeepAspect;

export interface TargetConfig {
  [key: string]: TargetConfigItem;
}

export interface FormatConfig {
  [key: string]:
    | OutputOptions
    | AvifOptions
    | GifOptions
    | HeifOptions
    | JpegOptions
    | PngOptions
    | TiffOptions
    | WebpOptions;
}

interface ImpIntermediateConfig {
  inputFiles?: string[];
  outputDir?: string;
  targets: TargetConfig;
  formatOptions?: FormatConfig;
  loggingOptions?: string;
}

export interface ImpConfig {
  inputFiles: string[];
  outputDir: string;
  targets: TargetConfig;
  formatOptions: FormatConfig;
  loggingOptions?: string;
}

/* *** INTERNAL CONSTANTS *** */

export class ImpConfigureError extends ImpError {
  constructor(message: string) {
    super(message);
  }
}

class ImpConfigureCosmiconfError extends ImpConfigureError {
  constructor(message: string) {
    super(message);
  }
}

class ImpConfigureMissingParameterError extends ImpConfigureError {
  constructor(message: string) {
    super(message);
  }
}

/* The followin object defines the accepted command line options as required
 * by stdio.getopt().
 * It is actually used by lib/configure getConfig() to parse the command line
 * input.
 */
export const cmdLineOptions: Config = {
  configFile: {
    args: 1,
    default: false,
    description: "Specify the configuration file to be used",
    key: "c",
    required: false,
  },
  debug: {
    args: 0,
    default: false,
    description: "Flag to activate debug mode",
    key: "d",
    required: false,
  },
  inputFile: {
    args: "*",
    default: false,
    description: "The input file; may be specified multiple times",
    key: "i",
    multiple: true,
    required: false,
  },
  outputDir: {
    args: 1,
    default: false,
    description: "Directory to write processed files to",
    key: "o",
    required: false,
  },
  quiet: {
    args: 0,
    default: false,
    description: "Disable all logging messages",
    key: "q",
    required: false,
  },
};

function cosmiconfigWrapper(
  configFile: string | boolean,
  clearCache: boolean
): Promise<CosmiconfigResult> {
  const explorer = cosmiconfig("imp");

  if (clearCache === true) explorer.clearCaches();

  if (configFile !== false) {
    return explorer.load(configFile as string);
  } else {
    return explorer.search();
  }
}

/**
 * Check the results of Cosmiconfig and handle possible return states.
 *
 * Because Cosmiconfig will actually *resolve* with empty return values, that
 * are not usable for this module, these return values have to be handled in
 * a special way.
 * Parsing and consequently rejecting in the body of getConfig() raised all
 * types of (I guess TypeScript-specific) typing problems, thus, this function
 * performs the required checks, rejects with its own error type, which is
 * handled in getConfig().
 * This works well enough, though I have no idea why it was not working in the
 * body.
 */
function checkCosmiconfResult(
  ccResult: CosmiconfigResult
): Promise<CosmiconfigResult> {
  return new Promise((resolve, reject) => {
    if (ccResult === null) {
      return reject(
        new ImpConfigureCosmiconfError("Could not find configuration object")
      );
    }

    /* This check was added due to the api specification of cosmiconf, but
     * actually "empty results" are already catched by the if-block above.
     * TODO: Check when this condition may be true, remove when possible.
     */
    if (ccResult?.isEmpty === true) {
      logger.debug("Cosmiconfig resolved to an empty configuration object...");
      logger.debug(
        `Cosmiconfig read this config file: "${ccResult?.filepath}"`
      );
      return reject(
        new ImpConfigureCosmiconfError("Configuration object must not be empty")
      );
    }

    logger.debug(`Read configuration from: "${ccResult?.filepath}"`);
    return resolve(ccResult);
  });
}

function mergeConfig(
  configObject: ImpIntermediateConfig,
  cmdLineParams: GetoptResponse
): Promise<ImpConfig> {
  return new Promise((resolve, reject) => {
    let inputFiles =
      cmdLineParams.inputFile ?? configObject.inputFiles ?? undefined;
    if (inputFiles === undefined)
      return reject(
        new ImpConfigureMissingParameterError(
          "Missing configuration value: inputFiles"
        )
      );

    if (typeof inputFiles === "string") inputFiles = [inputFiles];

    const outputDir =
      cmdLineParams.outputDir ?? configObject.outputDir ?? undefined;
    if (outputDir === undefined)
      return reject(
        new ImpConfigureMissingParameterError(
          "Missing configuration value: outputDir"
        )
      );

    return resolve({
      inputFiles: inputFiles,
      outputDir: outputDir,
      targets: configObject.targets,
      formatOptions: configObject.formatOptions,
      loggingOptions: configObject.loggingOptions,
    } as ImpConfig);
  });
}

function normalizeConfig(
  configObjectInput: any
): Promise<ImpIntermediateConfig> {
  const configObject = configObjectInput as ImpIntermediateConfig;

  return new Promise((resolve, reject) => {
    const targets = configObject.targets ?? undefined;
    if (targets === undefined)
      return reject(
        new ImpConfigureMissingParameterError(
          "Missing configuration value: targets"
        )
      );

    /* formatOptions are not mandatory.
     * The SharpRunner will actually just use sharp's default options, if no
     * format options are applied
     */
    const formatOptions = configObject.formatOptions ?? {};

    const inputFiles = configObject.inputFiles ?? undefined;
    if (inputFiles === undefined)
      logger.debug("inputFiles not specified in config object...");

    const outputDir = configObject.outputDir ?? undefined;
    if (outputDir === undefined)
      logger.debug("outputDir not specified in config object...");

    const loggingOptions = configObject.loggingOptions ?? undefined;

    return resolve({
      inputFiles: inputFiles,
      outputDir: outputDir,
      targets: targets,
      formatOptions: formatOptions,
      loggingOptions: loggingOptions,
    } as ImpIntermediateConfig);
  });
}

export function getConfig(argv: string[]): Promise<ImpConfig> {
  return new Promise((resolve, reject) => {
    /* Parse the command line arguments into actual usable parameters. */
    const cmdLineParams = getopt(cmdLineOptions, argv);

    /* This is not covered by unittests.
     * During manual testing, I could not reproduce this condition, because
     * getopt() will actually terminate the process on errors.
     * However, let's keep this here as a first line of defense.
     */
    if (cmdLineParams === null)
      return reject(
        new ImpConfigureError("Could not parse command line parameters")
      );

    cosmiconfigWrapper(
      cmdLineParams.configFile as string | boolean,
      cmdLineParams.debug as boolean
    )
      .then(checkCosmiconfResult)
      .catch((err) => {
        if (err instanceof ImpConfigureCosmiconfError) return reject(err);

        /* Cosmiconf does not throw/reject custom errors, so the actual error
         * is "catched" and then re-thrown / re-rejected with an module-specific
         * error class and message.
         * The original error is available in debug mode.
         */
        logger.debug(err);
        return reject(
          new ImpConfigureCosmiconfError(
            "Error during cosmiconf operation. Activate debug mode for details!"
          )
        );
      })
      .then((ccResult) => {
        return normalizeConfig(ccResult?.config);
      })
      .then((normalizedConfig) => {
        return mergeConfig(normalizedConfig, cmdLineParams);
      })
      .then((mergedConfig) => {
        return resolve(mergedConfig);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}
