// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { mocked } from "ts-jest/utils";

/* mock library imports */
jest.mock("sharp");

/* import the subject under test (SUT) */
import { SharpRunner } from "./sharprunner";

/* additional imports */
import sharp = require("sharp");
import { logger } from "./logging";
import { ImpConfig } from "./configure";

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

describe("SharpRunner.constructor()...", () => {
  it("...correctly stores configuration values and initialises the state", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */

    /* make the assertions */
    const runner = new SharpRunner(testInputFile, testConfig);
    expect(runner._inputFile).toBe(testInputFile);
    expect(runner._outputDir).toBe("testdir");
    expect(runner._targets).toBe(testConfig.targets);
    expect(runner._formatOptions).toStrictEqual({});
    expect(runner.__sharpPipeEntry).toBe(undefined);
    expect(runner._fileBasename).toBe("testInputFile");
  });
});

describe("SharpRunner._sharpPipeEntry", () => {
  it("...initialises a sharp.Sharp instance on first call", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };
    const mockedSharp = mocked(sharp, true);
    mockedSharp.mockReturnValue({} as sharp.Sharp);

    /* setup mocks and spies */

    /* make the assertions */
    const runner = new SharpRunner(testInputFile, testConfig);
    expect(runner.__sharpPipeEntry).toBe(undefined);

    const pipeEntry = runner._sharpPipeEntry;
    expect(pipeEntry).not.toBe(undefined);
    expect(sharp).toHaveBeenCalledTimes(1);
  });

  it("...returns the same instance of sharp.Sharp on multiple calls", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };
    const mockedSharp = mocked(sharp, true);
    mockedSharp.mockReturnValue({} as sharp.Sharp);

    /* setup mocks and spies */

    /* make the assertions */
    const runner = new SharpRunner(testInputFile, testConfig);
    expect(runner.__sharpPipeEntry).toBe(undefined);

    const pipeEntry = runner._sharpPipeEntry;
    expect(pipeEntry).not.toBe(undefined);

    const pipeEntry2 = runner._sharpPipeEntry;
    expect(pipeEntry2).not.toBe(undefined);

    expect(pipeEntry).toStrictEqual(pipeEntry2);
    expect(sharp).toHaveBeenCalledTimes(1);
  });
});
