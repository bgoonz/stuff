/*
 * Copyright 2021 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const {
  captureAttributesOnStarted,
  instrumentCollection,
  instrumentCursor,
  instrumentDb
} = require('./common')

/**
 * parser used to grab the collection and operation
 * on every mongo operation
 *
 * @param {Object} operation
 */
function queryParser(operation) {
  let collection = this.collectionName || 'unknown'
  // in v3.3.0 aggregate commands added the collection
  // to target
  if (this.operation && this.operation.target) {
    collection = this.operation.target
  } else if (this.ns) {
    collection = this.ns.split(/\./)[1] || collection
  }
  return {operation, collection}
}

/**
 * Registers relevant instrumentation for mongo >= 3.0.6
 * In 3.0.6 they refactored their "APM" module which removed
 * a lot of niceities around instrumentation classes.
 * see: https://github.com/mongodb/node-mongodb-native/pull/1675/files
 * This reverts back to instrumenting pre-canned methods on classes
 * as well as sets up a listener for when commands start to properly
 * add necessary attributes to segments
 *
 * @param {Shim} shim
 * @param {Object} mongodb resolved package
 */
module.exports = function instrument(shim, mongodb) {
  shim.setParser(queryParser)
  const instrumenter = mongodb.instrument(Object.create(null), () => {})
  captureAttributesOnStarted(shim, instrumenter)
  instrumentCursor(shim, mongodb.Cursor)
  instrumentCursor(shim, shim.require('./lib/aggregation_cursor'))
  instrumentCursor(shim, shim.require('./lib/command_cursor'))
  instrumentCollection(shim, mongodb.Collection)
  instrumentDb(shim, mongodb.Db)

  // calling instrument sets up listeners for a few events
  // we should restore this on unload to avoid leaking
  // event emitters
  shim.agent.once('unload', function uninstrumentMongo() {
    instrumenter.uninstrument()
  })
}
