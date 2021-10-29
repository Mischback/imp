// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";

/* mock library imports */
jest.mock("./lib/configure");
jest.mock("./lib/logging");
jest.mock("./lib/sharprunner");

/* import the subject under test (SUT) */
import { impMain } from "./main";

/* additional imports */
import { getConfig, ImpConfig, ImpConfigureError } from "./lib/configure";
import {
  applyDebugConfiguration,
  applyUserConfiguration,
  logger,
  suppressLogOutput,
} from "./lib/logging";
import { processImageList, SharpRunnerError } from "./lib/sharprunner";

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

describe("impMain()...", () => {
  it("...attaches SIGINT handler", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new ImpConfigureError("foo"));
    const processSpy = jest.spyOn(process, "on");

    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(78);
      expect(processSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("...applies quiet mode", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter", "-q"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new ImpConfigureError("foo"));
    (suppressLogOutput as jest.Mock).mockImplementation();

    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(78);
      expect(suppressLogOutput).toHaveBeenCalledTimes(1);
    });
  });

  it("...applies debug mode", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter", "-d"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new ImpConfigureError("foo"));
    (applyDebugConfiguration as jest.Mock).mockImplementation();

    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(78);
      expect(applyDebugConfiguration).toHaveBeenCalledTimes(1);
    });
  });

  it("...overrides quiet mode with debug mode", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter", "-q", "-d"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new ImpConfigureError("foo"));
    (suppressLogOutput as jest.Mock).mockImplementation();
    (applyDebugConfiguration as jest.Mock).mockImplementation();

    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(78);
      expect(suppressLogOutput).toHaveBeenCalledTimes(1);
      expect(applyDebugConfiguration).toHaveBeenCalledTimes(1);
    });
  });

  it("...applies user-provided logging configuration", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockResolvedValue({
      loggingOptions: {},
    } as ImpConfig);
    (processImageList as jest.Mock).mockRejectedValue(
      new SharpRunnerError("foo")
    );
    (applyUserConfiguration as jest.Mock).mockImplementation();

    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(65);
      expect(applyUserConfiguration).toHaveBeenCalledTimes(1);
    });
  });

  it("...returns the expected exit code 70 for unexpected errors", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new Error("foo"));
    /* make the assertions */
    return impMain(testArgv).catch((err: Error) => {
      expect(err).toBe(70);
    });
  });

  it("...correctly terminates with exit code 0 on success", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockResolvedValue({
      loggingOptions: {},
    } as ImpConfig);
    (processImageList as jest.Mock).mockResolvedValue(1337);

    /* make the assertions */
    return impMain(testArgv)
      .then((retVal) => {
        expect(retVal).toBe(0);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });
});
