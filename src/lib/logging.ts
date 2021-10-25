// SPDX-License-Identifier: MIT

/* Library imports */
import { ISettingsParam, Logger } from "tslog";

/**
 * The module's logging configuration for debug mode.
 *
 * This configuration is provided for development. The module's user may provide
 * their own logging configuration in their configuration file, which
 * effectively overrides this one.
 *
 * See documentation of "tslog" for a list of available options.
 *
 * @see ISettingsParam
 */
const debugLoggingConfiguration: ISettingsParam = {
  minLevel: "debug",
  displayFunctionName: true,
  displayFilePath: "hideNodeModulesOnly",
  printLogMessageInNewLine: true,
  suppressStdOutput: false,
};

/**
 * The module's default logging configuration.
 *
 * This configuration is provided for development. The module's user may provide
 * their own logging configuration in their configuration file, which
 * effectively overrides this one.
 *
 * See documentation of "tslog" for a list of available options.
 *
 * @see ISettingsParam
 */
const defaultLoggingConfiguration: ISettingsParam = {
  name: "ImP",
  displayLoggerName: true,
  minLevel: "info",
  displayFunctionName: false,
  displayFilePath: "hidden",
};

/**
 * The modules default logger.
 *
 * It will be initialized with sane default configuration. The configuration may
 * be overridden with a user-provided logging configuration.
 *
 * See documentation of "tslog" for a list of available options.
 *
 * @see defaultLoggingConfiguration
 * @see ISettingsParam
 */
export const logger = new Logger(defaultLoggingConfiguration);

/**
 * Apply a logging configuration to the logger.
 *
 * @param loggingConfig - The config to apply.
 *
 * See documentation of "tslog" for a list of available options.
 *
 * @see ISettingsParam
 */
export function applyLoggingConfiguration(loggingConfig: ISettingsParam): void {
  logger.setSettings(loggingConfig);
}

/**
 * Apply the default logging configuration for debug mode.
 */
export function applyDebugConfiguration(): void {
  applyLoggingConfiguration(debugLoggingConfiguration);
  logger.debug("Activated debug mode...");
}

/**
 * Apply a user-provided logging configuration.
 *
 * @param loggingConfig - The configuration to apply, as provided by a
 *                        configuration file.
 * @param debug - A flag to indicate, if the module was already running in
 *                debug mode.
 *
 * Before the user-provided logging configuration is applied, every value that
 * may be modified by the modules default logging configuration or default
 * debugging configuration is set to its default value as provided by "tslog".
 *
 * After applying the user-provided configuration, the debug-flag is evaluated
 * and the minLevel is adjusted to keep running with log level "debug".
 *
 * @see applyLoggingConfiguration
 * @see resetLoggingConfiguration
 * @see ISettingsParam
 */
export function applyUserConfiguration(
  loggingConfig: ISettingsParam,
  debug: boolean
): void {
  resetLoggingConfiguration();
  applyLoggingConfiguration(loggingConfig);

  if (debug === true) logger.setSettings({ minLevel: "debug" });
}

/**
 * Reset all tslog options back to their defaults
 *
 * This function will only reset those values, that are modified by the module's
 * pre-defined logging configurations.
 *
 * @see defaultLoggingConfiguration
 * @see debugLoggingConfiguration
 */
function resetLoggingConfiguration(): void {
  logger.setSettings({
    displayFunctionName: true,
    displayLoggerName: true,
    displayFilePath: "hideNodeModulesOnly",
    minLevel: "silly",
    printLogMessageInNewLine: false,
    suppressStdOutput: false,
  });
}

/**
 * Suppress all logging outputs.
 *
 * This function is used to provide the quiet mode.
 *
 * Please note: If there is a user-provided logging-configuration, this may be
 * overridden. Basically this means: if the user want to suppress logging output
 * AND provide his own logging configuration, he will have to include the option
 * "suppressStdOutput" in his configuration.
 */
export function suppressLogOutput(): void {
  logger.setSettings({ suppressStdOutput: true });
}
