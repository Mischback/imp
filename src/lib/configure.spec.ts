// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";

/* mock library imports */
jest.mock("cosmiconfig");
import { cosmiconfig } from "cosmiconfig";
jest.mock("stdio");
import { getopt } from "stdio";

/* import the subject under test (SUT) */
import { cmdLineOptions, getConfig } from "./configure";

/* additional imports */
import { GetoptResponse } from "stdio/dist/getopt";
import { ImpConfigureError } from "./errors";
import { logger } from "./logging";

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

describe("getConfig()...", () => {
  it("...rejects with an error, if getopt() failed", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue(null);
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv).catch((err) => {
      expect(err).toBeInstanceOf(ImpConfigureError);
      expect(err.message).toBe("Could not parse command line parameters");
      expect(getopt).toHaveBeenCalledTimes(1);
      expect(getopt).toHaveBeenCalledWith(cmdLineOptions, testArgv);
      expect(spyLoggerDebug).toHaveBeenCalledTimes(0);
    });
  });
});

describe("cosmiconfigWrapper()...", () => {
  it("...uses the specified configuration file", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockRejectedValue("foo");

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue({
      configFile: testConfigFile,
      debug: false,
    } as GetoptResponse);
    (cosmiconfig as jest.Mock).mockReturnValue({
      load: mockCCLoad,
    });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv).catch((err) => {
      expect(err).toBeInstanceOf(ImpConfigureError);
      expect(err.message).toBe(
        "Error during cosmiconf operation. Activate debug mode for details!"
      );
      expect(cosmiconfig).toHaveBeenCalledTimes(1);
      expect(cosmiconfig).toHaveBeenCalledWith("imp");
      expect(mockCCLoad).toHaveBeenCalledTimes(1);
      expect(mockCCLoad).toHaveBeenCalledWith(testConfigFile);
      expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
    });
  });

  it("...searches for a configuration file/object", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const mockCCSearch = jest.fn().mockRejectedValue("foo");

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue({
      configFile: false,
      debug: false,
    } as GetoptResponse);
    (cosmiconfig as jest.Mock).mockReturnValue({
      search: mockCCSearch,
    });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv).catch((err) => {
      expect(err).toBeInstanceOf(ImpConfigureError);
      expect(err.message).toBe(
        "Error during cosmiconf operation. Activate debug mode for details!"
      );
      expect(cosmiconfig).toHaveBeenCalledTimes(1);
      expect(cosmiconfig).toHaveBeenCalledWith("imp");
      expect(mockCCSearch).toHaveBeenCalledTimes(1);
      expect(mockCCSearch).toHaveBeenCalledWith();
      expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
    });
  });
});
