// SPDX-License-Identifier: MIT

/* library imports */
import { Config } from "stdio/dist/getopt";

/* internal imports */
import { getConfig } from "./lib/configure";
import { ImpConfigureError } from "./lib/errors";
import { logger, applyDebugConfiguration } from "./lib/logging";

/* *** INTERNAL CONSTANTS *** */
const EXIT_SUCCESS = 0; // sysexits.h: 0 -> successful termination
const EXIT_INTERNAL_ERROR = 70; // sysexits.h: 70 -> internal software error
const EXIT_CONFIG_ERROR = 78; // sysexits.h: 78 -> configuration error
const EXIT_SIGINT = 130; // bash scripting guide: 130 -> terminated by ctrl-c

/* The followin object defines the accepted command line options as required
 * by stdio.getopt().
 * It is actually used by lib/configure getConfig() to parse the command line
 * input.
 */
const cmdLineOptions: Config = {
  configFile: {
    args: 1,
    default: false,
    description: "Specify the configuration file to be used",
    key: "c",
    required: false,
  },
  debug: {
    args: 1,
    default: false,
    description: "Flag to activate debug mode",
    key: "d",
    required: false,
  },
  inputFile: {
    args: "*",
    default: false,
    description: "The input file; may be specified multiple times",
    key: "i",
    multiple: true,
    required: false,
  },
  outputDir: {
    args: 1,
    default: false,
    description: "Directory to write processed files to",
    key: "o",
    required: false,
  },
};

export function main(argv: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    /* Setting up a handler for SIGINT (Ctrl-C)
     * This handler may be useful for cleaning up before terminating the script.
     * At least it will resolve to the "correct" exit code.
     */
    process.on("SIGINT", () => {
      logger.info("Caught interrupt signal (Ctrl-C). Exiting!");
      return reject(EXIT_SIGINT);
    });

    /* Activate the debug mode as early as possible
     * This is done without getopt() from stdio, because getopt() will be called
     * later during startup.
     * FIXME: Ok, not longer hardcoded, but with a REAL ugly cast!
     *        See node_modules/stdio/dist/getopt.d.ts
     */
    const debugKey =
      (
        cmdLineOptions?.debug as {
          key?: string;
          description?: string;
          multiple?: boolean;
          args?: string | number;
          mandatory?: boolean;
          required?: boolean;
          default?: string | boolean | string[];
          maxArgs?: number;
          minArgs?: number;
        }
      )["key"] || "d";
    if (argv.indexOf(`-${debugKey}`) > -1) {
      applyDebugConfiguration();
    }

    /* The actual payload starts here */
    getConfig(argv, cmdLineOptions)
      .then(() => {
        return resolve(EXIT_SUCCESS);
      })
      .catch((err) => {
        /* handle "known" errors */
        if (err instanceof ImpConfigureError) {
          logger.error(err.message);
          logger.fatal("Could not determine configuration for ImP!");
          return reject(EXIT_CONFIG_ERROR);
        }

        /* general error handler */
        logger.error("Whoops, that was unexpected!");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        logger.error(err.message);
        logger.fatal("An unexpected error occured. Aborting!");
        return reject(EXIT_INTERNAL_ERROR);
      });
  });
}
