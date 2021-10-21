// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";

/* mock library imports */
// INSERT LIB IMPORTS HERE!

/* import the subject under test (SUT) */
import {
  applyDebugConfiguration,
  applyLoggingConfiguration,
  logger,
  suppressLogOutput,
} from "./logging";

/* additional imports */
import { ISettingsParam, ISettings } from "tslog";

/* Run these before actually starting the test suite */
beforeAll(() => {
  /* The test subject relies on "tslog" to provide log messages.
   * For running the test-suite, actually printing the log messages to the
   * console is unwanted, so the output is suppressed.
   */
  logger.setSettings({
    suppressStdOutput: true,
  });
});

describe("applyDebugConfiguration()...", () => {
  it("...applies the provided default debug config", () => {
    /* This is actually the provided logging configuration for the debug mode.
     * It is copy/pasted from "logging.ts", because it is not exported. However,
     * this means that this test will fail, if/when this default config is
     * modified.
     */
    const debugLoggingConfiguration: ISettingsParam = {
      minLevel: "debug",
      displayFunctionName: true,
      displayFilePath: "hideNodeModulesOnly",
      printLogMessageInNewLine: true,
      suppressStdOutput: false,
    };

    /* setup mocks and spies */
    const spyLoggerSetSettings = jest
      .spyOn(logger, "setSettings")
      .mockImplementationOnce((_settings) => {
        return {} as ISettings;
      });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    expect(applyDebugConfiguration()).toBe(undefined);
    expect(spyLoggerSetSettings).toHaveBeenCalledTimes(1);
    expect(spyLoggerSetSettings).toHaveBeenCalledWith(
      debugLoggingConfiguration
    );
    expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
  });
});

describe("applyLoggingConfiguration()...", () => {
  it("...applies the configuration as provided by parameter", () => {
    /* define the parameter */
    const testConfiguration: ISettingsParam = {
      name: "TESTCASE",
      minLevel: "error",
      printLogMessageInNewLine: false,
    };

    /* setup mocks and spies */
    const spyLoggerSetSettings = jest.spyOn(logger, "setSettings");

    /* make the assertions */
    expect(applyLoggingConfiguration(testConfiguration)).toBe(undefined);
    expect(spyLoggerSetSettings).toHaveBeenCalledTimes(1);
    expect(spyLoggerSetSettings).toHaveBeenCalledWith(testConfiguration);
  });
});

describe("suppressLogOutput()...", () => {
  it("...applies the argument to suppress output", () => {
    /* define the parameter */
    const testConfiguration: ISettingsParam = { suppressStdOutput: true };

    /* setup mocks and spies */
    const spyLoggerSetSettings = jest.spyOn(logger, "setSettings");

    /* make the assertions */
    expect(suppressLogOutput()).toBe(undefined);
    expect(spyLoggerSetSettings).toHaveBeenCalledTimes(1);
    expect(spyLoggerSetSettings).toHaveBeenCalledWith(testConfiguration);
  });
});
