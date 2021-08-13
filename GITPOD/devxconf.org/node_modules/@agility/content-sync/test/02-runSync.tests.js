import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;


import { createSyncClient, createSyncClientUsingConsoleStore, createPreviewSyncClient } from './_syncClients.config'

const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}


/*
	This file contains static references to content from the instance configured in the apiClient.config file.
*/

//this file should always run first in the tests...

describe('runSync:', async function () {


	this.timeout('120s');

	it('should run 1 sync method using the filesystem', async function () {

		var sync = createSyncClient();
		await sync.runSync();

		await sync.clearSync();

	})


	it('should run 3 syncs at the same time method using the filesystem', async function () {

		let sync1 = createSyncClient();
		let sync2 = createSyncClient();
		let sync3 = createSyncClient();

		let p1 = sync1.runSync();
		let p2 = sync2.runSync();
		let p3 = sync3.runSync();

		await Promise.all([p1, p2, p3])

	})


	it('should run 3 syncs 1.5 secs apart', async function () {

		let sync1 = createSyncClient();
		let sync2 = createSyncClient();
		let sync3 = createSyncClient();
		await sleep(1500)
		await sync1.runSync();
		await sleep(1500)
		await sync2.runSync();
		await sleep(1500)
		await sync3.runSync();

	})

});

describe('runSync:', async function () {

	this.timeout('120s');

	it('should run sync method using the console store', async function () {
		var sync = createSyncClientUsingConsoleStore();
		await sync.runSync();
	})

});

