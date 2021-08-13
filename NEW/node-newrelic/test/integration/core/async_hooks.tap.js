/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const exec = require('child_process').execSync
exec('node --expose-gc ./async_hooks.js', {
  stdio: 'inherit',
  cwd: __dirname
})
