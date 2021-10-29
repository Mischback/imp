// SPDX-License-Identifier: MIT

/**
 * Base class for all module-related errors.
 */
export class ImpError extends Error {
  constructor(message: string) {
    super(message);
  }
}
