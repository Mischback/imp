// SPDX-License-Identifier: MIT

/* Library imports */
import { ISettingsParam, Logger } from "tslog";

const defaultLoggingConfiguration: ISettingsParam = {
  name: "ImP",
  displayLoggerName: true,
  minLevel: "info",
  displayFunctionName: false,
  displayFilePath: "hidden",
};

export const logger = new Logger(defaultLoggingConfiguration);
