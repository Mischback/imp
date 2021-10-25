#!/usr/bin/env node

// SPDX-License-Identifier: MIT

/* internal imports */
import { impMain } from "./main";

impMain(process.argv)
  .then((retVal) => {
    process.exit(retVal);
  })
  .catch((errno: number) => {
    process.exit(errno);
  });
