// SPDX-License-Identifier: MIT

/* library imports */
import { getopt } from "stdio";
import { Config } from "stdio/dist/getopt";

/* internal imports */
import { ImpConfigureError } from "./errors";
import { logger } from "./logging";

/* *** INTERNAL CONSTANTS *** */

export function getConfig(
  argv: string[],
  cmdLineOptions: Config
): Promise<void> {
  return new Promise((resolve, reject) => {
    /* Parse the command line arguments into actual usable parameters. */
    const cmdLineParams = getopt(cmdLineOptions, argv);

    /* This is not covered by unittests.
     * During manual testing, I could not reproduce this condition, because
     * getopt() will actually terminate the process on errors.
     * However, let's keep this here as a first line of defense.
     */
    if (cmdLineParams === null)
      return reject(
        new ImpConfigureError("Could not parse command line parameters")
      );

    // FIXME: just for successful compilation/linting, remove later!
    logger.debug(cmdLineParams);

    return resolve();
  });
}
