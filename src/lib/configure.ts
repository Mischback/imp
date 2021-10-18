// SPDX-License-Identifier: MIT

/* library imports */

/* internal imports */

export function getConfig(argv: string[]): Promise<void> {
  return new Promise((resolve, _reject) => {
    // FIXME: just for compilation
    console.log(argv);

    return resolve();
  });
}
