#!/usr/bin/env node

// SPDX-FileCopyrightText: 2022 Mischback
// SPDX-License-Identifier: MIT
// SPDX-FileType: SOURCE

/* internal imports */
import { impMain } from "./main";

impMain(process.argv)
  .then((retVal) => {
    process.exit(retVal);
  })
  .catch((errno: number) => {
    process.exit(errno);
  });
