// SPDX-License-Identifier: MIT

/**
 * This file originated by the repository template, that was used to create this
 * repository.
 * It will be removed or adjusted, once there are other tests to be run.
 */

/* Test specific imports */
import { describe, expect, it } from "@jest/globals";

describe("This is just a generic example...", () => {
  it("...to verify that tests can fail", () => {
    expect(1).toBe(2);
  });

  it.only("...to verify that tests can pass", () => {
    expect(1).toBe(1);
  });
});
