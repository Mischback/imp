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
import { ISettingsParam } from "tslog";

/* internal imports */
import { ImpError } from "./errors";
import { logger } from "./logging";

/* *** TYPE DEFINITIONS *** */

/**
 * These are the accepted values for target formats.
 * They are synchronized with Sharp's accepted values aswell as the list of
 * file extensions @constant sharprunner.TargetFormatExtensions
 */
export type TargetFormat =
  | "avif"
  | "gif"
  | "heif"
  | "jpeg"
  | "png"
  | "tiff"
  | "webp";

/**
 * A TargetConfigItem that does not apply any scaling to the source image.
 * @see TargetConfigItem
 */
interface TargetItemDoNotScale {
  mode: "do-not-scale";
  filenameSuffix: string;
  formats: TargetFormat[];
}

/**
 * A TargetConfigItem that applies scaling, relative to the width of the source
 * image.
 * @see TargetConfigItem
 */
interface TargetItemKeepAspect {
  mode: "keep-aspect";
  filenameSuffix: string;
  formats: TargetFormat[];
  width: number;
}

/**
 * A TargetConfigItem that applies scaling, relative to the height of the source
 * image.
 * @see TargetConfigItem
 */
interface TargetItemKeepAspect {
  mode: "keep-aspect";
  filenameSuffix: string;
  formats: TargetFormat[];
  height: number;
}

/**
 * One item of a target configuration
 * @see TargetConfig
 */
export type TargetConfigItem = TargetItemDoNotScale | TargetItemKeepAspect;

/**
 * The target configuration is a dictionary of TargetConfigItems with a string
 * used as key.
 * @see TargetConfigItem
 */
export interface TargetConfig {
  [key: string]: TargetConfigItem;
}

/**
 * The format configuration is dictionary of Sharp's output options with a
 * string used as key.
 * @see OutputOptions
 * @see AvifOptions
 * @see GifOptions
 * @see HeifOptions
 * @see JpegOptions
 * @see PngOptions
 * @see TiffOptions
 * @see WebpOptions
 */
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

/**
 * An intermediate configuration object, that does not yet enforce the presence
 * of certain values.
 * @see ImpConfig
 * @see TargetConfig
 * @see FormatConfig
 * @see ISettingsParam
 */
interface ImpIntermediateConfig {
  inputFiles?: string[];
  outputDir?: string;
  targets: TargetConfig;
  formatOptions?: FormatConfig;
  loggingOptions?: ISettingsParam;
}

/**
 * The actual configuration object to proceed operation.
 * @see TargetConfig
 * @see FormatConfig
 * @see ISettingsParam
 */
export interface ImpConfig {
  inputFiles: string[];
  outputDir: string;
  targets: TargetConfig;
  formatOptions: FormatConfig;
  loggingOptions?: ISettingsParam;
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

/**
 * This constant defines the accepted command line options as required
 * by stdio.getopt().
 * @see getopt
 * @see getConfig
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

/**
 * Small wrapper around Cosmiconfig to provide a unified interface for loading
 * a specified configuration file aswell as having Cosmiconfig searching for
 * the configuration file.
 * Additionally, this function ensures, that Cosmiconfig's cache is cleared
 * while running in debug mode.
 *
 * @param configFile - A path/filename to a config file to be loaded or false
 *                     to look for a configuration using Cosmiconfig's search().
 * @param clearCache - A flag to indicate, if Cosmiconfig's cache should be
 *                     cleared.
 * @returns - A Promise resolving to a CosmiconfigResult
 *
 * @see CosmiconfigResult
 * @see cosmiconfig
 */
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
 * @param ccResult - The CosmiconfigResult as returned by cosmiconfigWrapper
 * @returns - A Promise resolving to a CosmiconfigResult
 *
 * Because Cosmiconfig will actually *resolve* with empty return values, that
 * are not usable for this module, these return values have to be handled in
 * a special way.
 *
 * @see cosmiconfigWrapper
 * @see CosmiconfigResult
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

/**
 * Merge command line parameters with options read from configuration file.
 *
 * @param configObject {ImpIntermediateConfig} - These options are read from a
 *                                               configuration file by
 *                                               Cosmiconfig
 * @param cmdLineParams {GetoptResponse} - These options are read/parsed from
 *                                         the command line by getopt()
 * @returns - A Promise, resolving to an actual ImpConfig
 *
 * Mandatory values are the list of input files, the output directory and the
 * target configuration.
 * If getopt() was called with a single input file (which then will be provided
 * as string), it is wrapped inside a list, to match the type declaration and
 * enable further processing.
 *
 * @see ImpIntermediateConfig
 * @see GetoptResponse
 * @see ImpConfig
 */
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

/**
 * Convert the result of Cosmiconfig into an ImpIntermediateConfig.
 *
 * @param configObjectInput - The configuration options as determined by using
 *                            Cosmiconfig
 * @returns - A Promise, resolving to a ImpIntermediateConfig object
 *
 * Basically this function casts the received value into the required target
 * type.
 * Additionally, all other required values are at least initialized. The
 * presence of a target configuration is enforced.
 *
 * @see ImpIntermediateConfig
 */
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

/**
 * Determine the configuration for processing.
 *
 * @param argv - The argument vector which was used to call the module
 * @returns - A Promise, resolving to an instance of ImpConfig
 *
 * @see ImpConfig
 * @see getopt
 * @see cosmiconfig
 */
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
