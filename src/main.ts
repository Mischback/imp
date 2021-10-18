// SPDX-License-Identifier: MIT

/* internal imports */
import { getConfig } from "./lib/configure";
import { logger, applyDebugConfiguration } from "./lib/logging";

/* *** INTERNAL CONSTANTS *** */
const EXIT_SUCCESS = 0; // sysexits.h: 0 -> successful termination
const EXIT_INTERNAL_ERROR = 70; // sysexits.h: 70 -> internal software error
const EXIT_SIGINT = 130; // bash scripting guide: 130 -> terminated by ctrl-c

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
    getConfig(argv)
      .then(() => {
        return resolve(EXIT_SUCCESS);
      })
      .catch((err) => {
        /* general error handler */
        logger.error("Whoops, that was unexpected!");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        logger.error(err.message);
        logger.fatal("An unexpected error occured. Aborting!");
        return reject(EXIT_INTERNAL_ERROR);
      });
  });
}
