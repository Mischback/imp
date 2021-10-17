#!/usr/bin/env node

// SPDX-License-Identifier: MIT

/* internal imports */
import { main } from "./main";

main(process.argv)
  .then((retVal) => {
    process.exit(retVal);
  })
  .catch((errno: number) => {
    process.exit(errno);
  });
