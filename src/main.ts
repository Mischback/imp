// SPDX-License-Identifier: MIT

/* internal imports */
import { logger } from "./lib/logging";

/* *** INTERNAL CONSTANTS *** */
const EXIT_SUCCESS = 0; // sysexits.h: 0 -> successful termination
// const EXIT_INTERNAL_ERROR = 70; // sysexits.h: 70 -> internal software error
const EXIT_SIGINT = 130; // bash scripting guide: 130 -> terminated by ctrl-c

export function main(argv: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    /* Setting up a handler for SIGINT (Ctrl-C)
     * This handler may be useful for cleaning up before terminating the script.
     * At least it will resolve to the "correct" exit code.
     */
    process.on("SIGINT", () => {
      // logger.info("Caught interrupt signal (Ctrl-C). Exiting!");
      logger.info("Caught interrupt signal (Ctrl-C). Exiting!");
      return reject(EXIT_SIGINT);
    });

    // FIXME: Just for compilation
    logger.info(argv);

    return resolve(EXIT_SUCCESS);
  });
}
