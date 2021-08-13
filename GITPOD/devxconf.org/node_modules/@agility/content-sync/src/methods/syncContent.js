import { logInfo, logWarning, sleep } from '../util'


/**
 * Sync the content items in the specified Agility Instance.
 */
export default async function (languageCode, token) {
    const storeInterface = this.store;

	if (!token) token = 0;

	let itemCount = 0
	let busy = false
	let waitMS = 0
	const waitMaxMS = 30000
	const waitIntervalMS = 500

	do {

		//sync content items...
		const syncRet = await this.agilityClient.getSyncContent({
			syncToken: token,
			pageSize: 100,
			languageCode: languageCode,

		});

		if (syncRet.busy !== undefined
			&& syncRet.busy === true) {
			//if the api is being updated, wait a few ms and try again...
			waitMS += waitIntervalMS
			if (waitMS > waitMaxMS) {
				logWarning("Sync API has been busy for too long, canceling.")
				break
			}

			if (! busy) {
				//first time we're busy...
				busy = true
				logInfo("Sync API is busy.  Waiting...")
			}

			await sleep(waitIntervalMS)
			continue
		}

		if (busy === true) {
			logInfo("Continuing sync...")
			busy = false
			waitMS = 0
		}

		const syncItems = syncRet.items;

		//if we don't get anything back, kick out
		if (syncItems.length === 0) {
			break;
		}

		for (let index = 0; index < syncItems.length; index++) {
			await storeInterface.saveContentItem({ contentItem: syncItems[index], languageCode });
		}

		token = syncRet.syncToken;
		itemCount += syncItems.length;

	} while (token > 0 || busy === true)

	if (itemCount > 0) {
		logInfo(`Content Sync returned ${itemCount} item(s).`);
	} else {
		logInfo(`Content Sync returned no item(s).`);
	}

	return token;
}