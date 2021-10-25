// SPDX-License-Identifier: MIT

/* library imports */
import { Config } from "stdio/dist/getopt";

/* internal imports */
import { cmdLineOptions, getConfig, ImpConfigureError } from "./lib/configure";
import {
  logger,
  applyDebugConfiguration,
  suppressLogOutput,
} from "./lib/logging";
import { processImageList, SharpRunnerError } from "./lib/sharprunner";

/* *** INTERNAL CONSTANTS *** */
const EXIT_SUCCESS = 0; // sysexits.h: 0 -> successful termination
const EXIT_DATA_ERROR = 65; // sysexits.h: 65 -> input data was incorrect in some way
const EXIT_INTERNAL_ERROR = 70; // sysexits.h: 70 -> internal software error
const EXIT_CONFIG_ERROR = 78; // sysexits.h: 78 -> configuration error
const EXIT_SIGINT = 130; // bash scripting guide: 130 -> terminated by ctrl-c

/* *** TYPE DEFINITIONS *** */
type StdioConfigItem = Exclude<Config, boolean | undefined>;

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

    /* Activate the quiet mode as early as possible
     * This is done without getopt() from stdio, because getopt() will be called
     * later during startup.
     * Please note: if quiet mode and debug mode are activated, debug mode wins.
     */
    const quietKey = (cmdLineOptions.quiet as StdioConfigItem)["key"];
    if (argv.indexOf(`-${quietKey as string}`) > -1) {
      suppressLogOutput();
    }

    /* Activate the debug mode as early as possible
     * This is done without getopt() from stdio, because getopt() will be called
     * later during startup.
     */
    const debugKey = (cmdLineOptions.debug as StdioConfigItem)["key"];
    if (argv.indexOf(`-${debugKey as string}`) > -1) {
      applyDebugConfiguration();
    }

    /* The actual payload starts here */
    getConfig(argv)
      .then((configObject) => {
        return processImageList(configObject);
      })
      .then((retVal) => {
        logger.info(`Processed ${retVal} pipes!`);
        return resolve(EXIT_SUCCESS);
      })
      .catch((err) => {
        /* handle "known" errors */
        if (err instanceof ImpConfigureError) {
          logger.error(err.message);
          logger.fatal("Could not determine configuration for ImP!");
          return reject(EXIT_CONFIG_ERROR);
        }

        if (err instanceof SharpRunnerError) {
          logger.error(err.message);
          logger.fatal("Could not process images!");
          return reject(EXIT_DATA_ERROR);
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
