// SPDX-License-Identifier: MIT

/* test specific imports */
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { mocked } from "ts-jest/utils";

/* mock library imports */
jest.mock("fs");
jest.mock("path");
jest.mock("sharp");

/* import the subject under test (SUT) */
import { SharpRunner, SharpRunnerError } from "./sharprunner";

/* additional imports */
import { createReadStream } from "fs";
import { basename, join } from "path";
import sharp = require("sharp");
import { logger } from "./logging";
import { ImpConfig, TargetConfigItem } from "./configure";

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
    const testBasename = "testBasename";
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
    (basename as jest.Mock).mockReturnValue(testBasename);

    /* make the assertions */
    const runner = new SharpRunner(testInputFile, testConfig);
    expect(runner._inputFile).toBe(testInputFile);
    expect(runner._outputDir).toBe("testdir");
    expect(runner._targets).toBe(testConfig.targets);
    expect(runner._formatOptions).toStrictEqual({});
    expect(runner.__sharpPipeEntry).toBe(undefined);
    expect(runner._fileBasename).toBe(testBasename);
  });
});

describe("SharpRunner._buildPipes()...", () => {
  it("...rejects, if _createPipe() throws an error", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    createPipeSpy.mockImplementation(() => {
      throw new Error("testError");
    });

    /* make the assertions */
    return runner._buildPipes().catch((err) => {
      expect(err.message).toBe("testError");
      expect(createPipeSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("...resolves with a list of pipes for a single target", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    createPipeSpy.mockReturnValue({} as sharp.Sharp);

    /* make the assertions */
    return runner
      ._buildPipes()
      .then((retVal) => {
        expect(retVal.length).toBe(1);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...correclty resolves with a list of pipes for multiple targets", () => {
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
        small: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    createPipeSpy.mockReturnValue({} as sharp.Sharp);

    /* make the assertions */
    return runner
      ._buildPipes()
      .then((retVal) => {
        expect(retVal.length).toBe(2);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...correclty resolves with a list of pipes for multiple target formats", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png", "gif"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    createPipeSpy.mockReturnValue({} as sharp.Sharp);

    /* make the assertions */
    return runner
      ._buildPipes()
      .then((retVal) => {
        expect(retVal.length).toBe(2);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...correclty resolves with a list of pipes for multiple targets with multiple target formats", () => {
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
        small: {
          mode: "do-not-scale",
          filenameSuffix: "",
          formats: ["png", "gif"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    createPipeSpy.mockReturnValue({} as sharp.Sharp);

    /* make the assertions */
    return runner
      ._buildPipes()
      .then((retVal) => {
        expect(retVal.length).toBe(3);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...issues a warning, if the target format is not supported", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          // TypeScript and eslint correctly prohibit this, but it may be
          // specified in the config file. Enforce this test!
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          formats: ["pngs"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const createPipeSpy = jest.spyOn(runner, "_createPipe");
    const loggerWarnSpy = jest.spyOn(logger, "warn");

    /* make the assertions */
    return runner
      ._buildPipes()
      .then((retVal) => {
        expect(retVal.length).toBe(0);
        expect(createPipeSpy).toHaveBeenCalledTimes(1);
        expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });
});

describe("SharpRunner._createPipe()...", () => {
  it("...throws an error if the target format is not supported", () => {
    /* define the parameter */
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        full: {
          mode: "do-not-scale",
          filenameSuffix: "",
          // TypeScript and eslint correctly prohibit this, but it may be
          // specified in the config file. Enforce this test!
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          formats: ["pngs"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);

    /* make the assertions */
    // TypeScript and eslint correctly prohibit this, but it may be
    // specified in the config file. Enforce this test!
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => runner._createPipe(testConfig.targets.full, "pngs")).toThrow();
  });

  it("...correctly applies pipes for mode 'do-not-scale'", () => {
    /* define the parameter */
    const testJoin = "testJoin";
    const testFormat = "png";
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockedToFile = jest.fn().mockReturnValue("foobar");
    const mockedToFormat = jest.fn(() => {
      return {
        toFile: mockedToFile,
      };
    });
    const mockedSharpPipeEntry = {
      clone: jest.fn(() => {
        return {
          toFormat: mockedToFormat,
        };
      }),
    };
    Object.defineProperty(runner, "_sharpPipeEntry", {
      value: mockedSharpPipeEntry,
    });
    (join as jest.Mock).mockReturnValue(testJoin);

    /* make the assertions */
    const retVal = runner._createPipe(
      testConfig.targets.full as TargetConfigItem,
      testFormat
    );
    expect(retVal).toBe("foobar");
    expect(mockedToFile).toHaveBeenCalledTimes(1);
    expect(mockedToFile).toHaveBeenCalledWith(testJoin);
    expect(mockedToFormat).toHaveBeenCalledTimes(1);
    expect(mockedToFormat).toHaveBeenCalledWith(testFormat, {});
  });

  it("...correctly applies pipes for mode 'keep-aspect' with specified 'width'", () => {
    /* define the parameter */
    const testJoin = "testJoin";
    const testFormat = "png";
    const testDimension = 1337;
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        small: {
          mode: "keep-aspect",
          filenameSuffix: "",
          formats: ["png"],
          width: testDimension,
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockedToFile = jest.fn().mockReturnValue("foobar");
    const mockedToFormat = jest.fn().mockReturnValue({
      toFile: mockedToFile,
    });
    const mockedResize = jest.fn().mockReturnValue({
      toFormat: mockedToFormat,
    });
    const mockedSharpPipeEntry = {
      clone: jest.fn(() => {
        return {
          resize: mockedResize,
        };
      }),
    };
    Object.defineProperty(runner, "_sharpPipeEntry", {
      value: mockedSharpPipeEntry,
    });
    (join as jest.Mock).mockReturnValue(testJoin);

    /* make the assertions */
    const retVal = runner._createPipe(
      testConfig.targets.small as TargetConfigItem,
      testFormat
    );
    expect(retVal).toBe("foobar");
    expect(mockedToFile).toHaveBeenCalledTimes(1);
    expect(mockedToFile).toHaveBeenCalledWith(testJoin);
    expect(mockedToFormat).toHaveBeenCalledTimes(1);
    expect(mockedToFormat).toHaveBeenCalledWith(testFormat, {});
    expect(mockedResize).toHaveBeenCalledTimes(1);
    expect(mockedResize).toHaveBeenCalledWith({ width: testDimension });
  });

  it("...correctly applies pipes for mode 'keep-aspect' with specified 'height'", () => {
    /* define the parameter */
    const testJoin = "testJoin";
    const testFormat = "png";
    const testDimension = 1337;
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        small: {
          mode: "keep-aspect",
          filenameSuffix: "",
          formats: ["png"],
          height: testDimension,
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockedToFile = jest.fn().mockReturnValue("foobar");
    const mockedToFormat = jest.fn().mockReturnValue({
      toFile: mockedToFile,
    });
    const mockedResize = jest.fn().mockReturnValue({
      toFormat: mockedToFormat,
    });
    const mockedSharpPipeEntry = {
      clone: jest.fn(() => {
        return {
          resize: mockedResize,
        };
      }),
    };
    Object.defineProperty(runner, "_sharpPipeEntry", {
      value: mockedSharpPipeEntry,
    });
    (join as jest.Mock).mockReturnValue(testJoin);

    /* make the assertions */
    const retVal = runner._createPipe(
      testConfig.targets.small as TargetConfigItem,
      testFormat
    );
    expect(retVal).toBe("foobar");
    expect(mockedToFile).toHaveBeenCalledTimes(1);
    expect(mockedToFile).toHaveBeenCalledWith(testJoin);
    expect(mockedToFormat).toHaveBeenCalledTimes(1);
    expect(mockedToFormat).toHaveBeenCalledWith(testFormat, {});
    expect(mockedResize).toHaveBeenCalledTimes(1);
    expect(mockedResize).toHaveBeenCalledWith({ height: testDimension });
  });

  it("...throws an error if the mode 'keep-aspect' is used without 'width'/'height'", () => {
    /* define the parameter */
    const testJoin = "testJoin";
    const testFormat = "png";
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        small: {
          mode: "keep-aspect",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockedToFile = jest.fn().mockReturnValue("foobar");
    const mockedToFormat = jest.fn().mockReturnValue({
      toFile: mockedToFile,
    });
    const mockedResize = jest.fn().mockReturnValue({
      toFormat: mockedToFormat,
    });
    const mockedSharpPipeEntry = {
      clone: jest.fn(() => {
        return {
          resize: mockedResize,
        };
      }),
    };
    Object.defineProperty(runner, "_sharpPipeEntry", {
      value: mockedSharpPipeEntry,
    });
    (join as jest.Mock).mockReturnValue(testJoin);

    /* make the assertions */
    expect(() =>
      runner._createPipe(
        testConfig.targets.small as TargetConfigItem,
        testFormat
      )
    ).toThrow();
  });

  it("...throws an error if called with an unknown 'mode'", () => {
    /* define the parameter */
    const testJoin = "testJoin";
    const testFormat = "png";
    const testInputFile = "testInputFile.jpg";
    const testConfig: ImpConfig = {
      inputFiles: [testInputFile],
      outputDir: "testdir",
      targets: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        small: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mode: "unknownmode",
          filenameSuffix: "",
          formats: ["png"],
        },
      },
      formatOptions: {},
    };

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockedToFile = jest.fn().mockReturnValue("foobar");
    const mockedToFormat = jest.fn().mockReturnValue({
      toFile: mockedToFile,
    });
    const mockedResize = jest.fn().mockReturnValue({
      toFormat: mockedToFormat,
    });
    const mockedSharpPipeEntry = {
      clone: jest.fn(() => {
        return {
          resize: mockedResize,
        };
      }),
    };
    Object.defineProperty(runner, "_sharpPipeEntry", {
      value: mockedSharpPipeEntry,
    });
    (join as jest.Mock).mockReturnValue(testJoin);

    /* make the assertions */
    expect(() =>
      runner._createPipe(
        testConfig.targets.small as TargetConfigItem,
        testFormat
      )
    ).toThrow();
  });
});

describe("SharpRunner._processPipes()...", () => {
  it("...rejects if called with an empty list of pipes", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);

    /* make the assertions */
    return runner._processPipes([]).catch((err) => {
      expect(err.message).toBe("No pipes to process");
    });
  });

  it("...rejects if one of the pipes fail to resolve", () => {
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
    const testPromise: Promise<void> = new Promise((_, reject) => {
      return reject();
    });

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockStreamOn = jest.fn();
    (createReadStream as jest.Mock).mockReturnValue({
      on: mockStreamOn,
    });

    /* make the assertions */
    return runner
      ._processPipes([testPromise as unknown as sharp.Sharp])
      .catch((err) => {
        expect(err.message).toBe("Error while processing the pipes");
        expect(mockStreamOn).toHaveBeenCalledTimes(2);
      });
  });

  it("...resolves with the number of processed pipes", () => {
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
    const testPromise: Promise<void> = new Promise((resolve) => {
      return resolve();
    });

    /* setup mocks and spies */
    const runner = new SharpRunner(testInputFile, testConfig);
    const mockStreamOn = jest.fn();
    (createReadStream as jest.Mock).mockReturnValue({
      on: mockStreamOn,
    });

    /* make the assertions */
    return runner
      ._processPipes([testPromise as unknown as sharp.Sharp])
      .then((retVal) => {
        expect(retVal).toBe(1);
        expect(mockStreamOn).toHaveBeenCalledTimes(2);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });
});

describe("SharpRunner.process()...", () => {
  it("...correctly rejects when encountering an error in _buildPipes()", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const buildPipesSpy = jest
      .spyOn(runner, "_buildPipes")
      .mockImplementation(() => {
        return Promise.reject(new SharpRunnerError("foobar"));
      });

    /* make the assertions */
    return runner.process().catch((err) => {
      expect(err).toBeInstanceOf(SharpRunnerError);
      expect(buildPipesSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("...correctly rejects when encountering an error in _processPipes()", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const buildPipesSpy = jest
      .spyOn(runner, "_buildPipes")
      .mockImplementation(() => {
        return Promise.resolve([]);
      });
    const processPipesSpy = jest
      .spyOn(runner, "_processPipes")
      .mockImplementation(() => {
        return Promise.reject(new SharpRunnerError("foobar"));
      });

    /* make the assertions */
    return runner.process().catch((err) => {
      expect(err).toBeInstanceOf(SharpRunnerError);
      expect(buildPipesSpy).toHaveBeenCalledTimes(1);
      expect(processPipesSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("...resolves with the number of processed pipes", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const buildPipesSpy = jest
      .spyOn(runner, "_buildPipes")
      .mockImplementation(() => {
        return Promise.resolve([]);
      });
    const processPipesSpy = jest
      .spyOn(runner, "_processPipes")
      .mockImplementation(() => {
        return Promise.resolve(1337);
      });

    /* make the assertions */
    return runner
      .process()
      .then((retVal) => {
        expect(retVal).toBe(1337);
        expect(buildPipesSpy).toHaveBeenCalledTimes(1);
        expect(processPipesSpy).toHaveBeenCalledTimes(1);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...catches unexpected errors and re-raises them", () => {
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
    const runner = new SharpRunner(testInputFile, testConfig);
    const buildPipesSpy = jest
      .spyOn(runner, "_buildPipes")
      .mockImplementation(() => {
        return Promise.reject(new Error("foobar"));
      });

    /* make the assertions */
    return runner.process().catch((err) => {
      expect(err).toBeInstanceOf(SharpRunnerError);
      expect(err.message).toBe(
        `Unexpected error while processing ${testInputFile}`
      );
      expect(buildPipesSpy).toHaveBeenCalledTimes(1);
    });
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
