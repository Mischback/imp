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

const cmdLineOptions: Config = {
  debug: {
    description: "Activate debug mode",
    key: "d",
    required: false,
    default: false,
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
     * TODO: As of now, "-d" is hardcoded. Probably this should be made
     *       dependent of the actual configuration.
     */
    if (argv.indexOf("-d") > -1) {
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
