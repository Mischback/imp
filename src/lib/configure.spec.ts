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
import { CosmiconfigResult } from "cosmiconfig/dist/types";
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

describe("checkCosmiconfResult()...", () => {
  it("...rejects with an error, if cosmiconfig returns an empty result", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockReturnValue(Promise.resolve(null));

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
      expect(err.message).toBe("Could not find configuration object");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(0);
    });
  });

  it("...rejects with an error, if cosmiconfig returns an object with isEmpty", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        isEmpty: true,
      } as CosmiconfigResult)
    );

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
      expect(err.message).toBe("Configuration object must not be empty");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(2);
    });
  });
});

describe("normalizeConfig()...", () => {
  it("...rejects with an error, if the targets value is missing", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {},
      } as CosmiconfigResult)
    );

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
      expect(err.message).toBe("Missing configuration value: targets");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
    });
  });

  it("...rejects with an error, if the formatOptions value is missing", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
        },
      } as CosmiconfigResult)
    );

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
      expect(err.message).toBe("Missing configuration value: formatOptions");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
    });
  });
});

describe("mergeConfig()...", () => {
  it("...rejects with an error, if the inputFiles value is missing", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
        },
      } as CosmiconfigResult)
    );

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
      expect(err.message).toBe("Missing configuration value: inputFiles");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(3);
    });
  });

  it("...accepts inputFiles provided by command line", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const testInputByCmdLine = "testInputByCmdLine.jpg";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
        },
      } as CosmiconfigResult)
    );

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue({
      configFile: testConfigFile,
      debug: false,
      inputFile: [testInputByCmdLine],
    } as GetoptResponse);
    (cosmiconfig as jest.Mock).mockReturnValue({
      load: mockCCLoad,
    });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv).catch((err) => {
      expect(err).toBeInstanceOf(ImpConfigureError);
      expect(err.message).toBe("Missing configuration value: outputDir");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(3);
    });
  });

  it("...accepts inputFiles provided by configuration object", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const testInputByFile = "testInputByFile.jpg";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
          inputFiles: [testInputByFile],
        },
      } as CosmiconfigResult)
    );

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
      expect(err.message).toBe("Missing configuration value: outputDir");
      expect(spyLoggerDebug).toHaveBeenCalledTimes(2);
    });
  });

  it("...accepts outputDir provided by command line", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const testInputByFile = "testInputByFile.jpg";
    const testDirByCmdLine = "testDirByCmdLine";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
          inputFiles: [testInputByFile],
        },
      } as CosmiconfigResult)
    );

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue({
      configFile: testConfigFile,
      debug: false,
      outputDir: testDirByCmdLine,
    } as GetoptResponse);
    (cosmiconfig as jest.Mock).mockReturnValue({
      load: mockCCLoad,
    });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv)
      .then((retVal) => {
        expect(retVal).toStrictEqual({
          inputFiles: [testInputByFile],
          outputDir: testDirByCmdLine,
          targets: "foo",
          formatOptions: "foo",
          loggingOptions: undefined,
        });
        expect(spyLoggerDebug).toHaveBeenCalledTimes(2);
      })
      .catch(() => {
        expect(1).toBe(2);
      });
  });

  it("...accepts outputDir provided by configuration object", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const testInputByFile = "testInputByFile.jpg";
    const testDirByFile = "testDirByFile";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
          inputFiles: [testInputByFile],
          outputDir: testDirByFile,
        },
      } as CosmiconfigResult)
    );

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
    return getConfig(testArgv)
      .then((retVal) => {
        expect(retVal).toStrictEqual({
          inputFiles: [testInputByFile],
          outputDir: testDirByFile,
          targets: "foo",
          formatOptions: "foo",
          loggingOptions: undefined,
        });
        expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
      })
      .catch((_err) => {
        expect(1).toBe(2);
      });
  });

  it("...overrides inputFiles / outputDir with command line parameters", () => {
    /* define the parameter */
    const testArgv = ["doesn't", "matter"];
    const testConfigFile = "testConfigFile.json";
    const testInputByFile = "testInputByFile.jpg";
    const testInputByCmdLine = "testInputByCmdLine.jpg";
    const testDirByFile = "testDirByFile";
    const testDirByCmdLine = "testDirByCmdLine";
    const mockCCLoad = jest.fn().mockReturnValue(
      Promise.resolve({
        config: {
          targets: "foo",
          formatOptions: "foo",
          inputFiles: [testInputByFile],
          outputDir: testDirByFile,
        },
      } as CosmiconfigResult)
    );

    /* setup mocks and spies */
    (getopt as jest.Mock).mockReturnValue({
      configFile: testConfigFile,
      debug: false,
      inputFile: [testInputByCmdLine],
      outputDir: testDirByCmdLine,
    } as GetoptResponse);
    (cosmiconfig as jest.Mock).mockReturnValue({
      load: mockCCLoad,
    });
    const spyLoggerDebug = jest.spyOn(logger, "debug");

    /* make the assertions */
    return getConfig(testArgv)
      .then((retVal) => {
        expect(retVal).toStrictEqual({
          inputFiles: [testInputByCmdLine],
          outputDir: testDirByCmdLine,
          targets: "foo",
          formatOptions: "foo",
          loggingOptions: undefined,
        });
        expect(spyLoggerDebug).toHaveBeenCalledTimes(1);
      })
      .catch((_err) => {
        expect(1).toBe(2);
      });
  });
});
