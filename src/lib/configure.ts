// SPDX-License-Identifier: MIT

/* library imports */
import { getopt } from "stdio";
import { Config } from "stdio/dist/getopt";

/* internal imports */
import { ImpConfigureError } from "./errors";

/* *** INTERNAL CONSTANTS *** */

export function getConfig(
  argv: string[],
  cmdLineOptions: Config
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmdLineArgs = getopt(cmdLineOptions, argv);

    /* This is not covered by unittests.
     * During manual testing, I could not reproduce this condition, because
     * getopt() will actually terminate the process on errors.
     * However, let's keep this here as a first line of defense.
     */
    if (cmdLineArgs === null)
      return reject(
        new ImpConfigureError("Could not parse command line parameters")
      );

    return resolve();
  });
}
