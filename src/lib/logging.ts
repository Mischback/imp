// SPDX-License-Identifier: MIT

/* Library imports */
import { ISettingsParam, Logger } from "tslog";

const debugLoggingConfiguration: ISettingsParam = {
  minLevel: "debug",
  displayFunctionName: true,
  displayFilePath: "hideNodeModulesOnly",
  printLogMessageInNewLine: true,
  suppressStdOutput: false,
};

const defaultLoggingConfiguration: ISettingsParam = {
  name: "ImP",
  displayLoggerName: true,
  minLevel: "info",
  displayFunctionName: false,
  displayFilePath: "hidden",
};

export const logger = new Logger(defaultLoggingConfiguration);

export function applyDebugConfiguration(
  debugConf: ISettingsParam = debugLoggingConfiguration
): void {
  logger.setSettings(debugConf);
  logger.debug("Activated debug mode...");
}

export function suppressLogOutput(): void {
  logger.setSettings({ suppressStdOutput: true });
}
