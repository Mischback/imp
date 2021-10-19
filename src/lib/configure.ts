// SPDX-License-Identifier: MIT

/* library imports */
import { cosmiconfig } from "cosmiconfig";
import { CosmiconfigResult } from "cosmiconfig/dist/types";
import { getopt } from "stdio";
import { Config } from "stdio/dist/getopt";

/* internal imports */
import { ImpConfigureError } from "./errors";
import { logger } from "./logging";

/* *** INTERNAL CONSTANTS *** */

class ImpConfigureCosmiconfError extends ImpConfigureError {
  constructor(message: string) {
    super(message);
  }
}

function cosmiconfigWrapper(
  configFile: string | boolean,
  clearCache: boolean
): Promise<CosmiconfigResult> {
  const explorer = cosmiconfig("imp");

  if (clearCache === true) explorer.clearCaches();

  if (configFile !== false) {
    return explorer.load(configFile as string);
  } else {
    return explorer.search();
  }
}

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

    cosmiconfigWrapper(
      cmdLineParams.configFile as string | boolean,
      cmdLineParams.debug as boolean
    )
      .then((result) => {
        if (result === null) {
          return reject(
            new ImpConfigureError("Could not find configuration object")
          );
        }

        /* This check was added due to the api specification of cosmiconf, but
         * actually "empty results" are already catched by the if-block above.
         * TODO: Check when this condition may be true, remove when possible.
         */
        if (result?.isEmpty === true) {
          logger.debug(
            "Cosmiconfig resolved to an empty configuration object..."
          );
          logger.debug(
            `Cosmiconfig read this config file: "${result?.filepath}"`
          );
          return reject(
            new ImpConfigureError("Configuration object must not be empty")
          );
        }

        logger.debug(`Read configuration from: "${result?.filepath}"`);
        logger.debug(result?.config);
        return resolve();
      })
      .catch((err) => {
        /* Cosmiconf does not throw/reject custom errors, so the actual error
         * is "catched" and then re-thrown / re-rejected with an module-specific
         * error class and message.
         * The original error is available in debug mode.
         */
        logger.debug(err);
        return reject(
          new ImpConfigureCosmiconfError(
            "Error during cosmiconf operation. Activate debug mode for details!"
          )
        );
      });
  });
}
