// SPDX-License-Identifier: MIT

class ImpError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ImpConfigureError extends ImpError {
  constructor(message: string) {
    super(message);
  }
}
