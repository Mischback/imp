// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";

/* mock library imports */
jest.mock("./lib/configure");
jest.mock("./lib/logging");

/* import the subject under test (SUT) */
import { impMain } from "./main";

/* additional imports */
import { getConfig, ImpConfigureError } from "./lib/configure";
import { logger, suppressLogOutput } from "./lib/logging";

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
  it("...attaches SIGINT handler", () => {});

  it("...applies quiet mode", () => {
    /* define the parameter */
    const testArgv = ["doen't", "matter", "-q"];

    /* setup mocks and spies */
    (getConfig as jest.Mock).mockRejectedValue(new ImpConfigureError("foo"));
    (suppressLogOutput as jest.Mock).mockImplementation(() => {});

    /* make the assertions */
    return impMain(testArgv).catch((err) => {
      expect(err).toBe(78);
      expect(suppressLogOutput).toHaveBeenCalledTimes(1);
    });
  });

  it("...applies debug mode", () => {});

  it("...overrides quiet mode with debug mode", () => {});

  it("...applies user-provided logging configuration", () => {});

  it("...returns the expected exit code of 78 for configuration errors", () => {});

  it("...returns the expected exit code of 65 for errors during processing", () => {});

  it("...returns the expected exit code 70 for unexpected errors", () => {});
});
