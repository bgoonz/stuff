import {
	logDebug,
	logInfo,
	logError,
	logWarning,
	logSuccess,
	asyncForEach,
} from "./util";

let store = null;
let options = null;

const validateStoreInterface = (storeCandidate) => {
	if (!storeCandidate.clearItems) {
		throw new TypeError(
			"Your sync store interface must implement `clearItems`."
		);
	}

	if (!storeCandidate.deleteItem) {
		throw new TypeError(
			"Your sync store interface must implement `deleteItem`."
		);
	}

	if (!storeCandidate.getItem) {
		throw new TypeError("Your sync store interface must implement `getItem`.");
	}

	if (!storeCandidate.saveItem) {
		throw new TypeError("Your sync store interface must implement `saveItem`.");
	}

	if (!storeCandidate.mergeItemToList) {
		throw new TypeError(
			"Your sync store interface must implement `mergeItemToList`."
		);
	}
};

const setStore = (storeToUse, storeOptions) => {
	validateStoreInterface(storeToUse);
	store = storeToUse;
	options = storeOptions;
};

const getStore = () => {
	return store
}

// sanitize graphql node names
const sanitizeName = (name) => {

	if (name !== undefined && name !== null) {
		return name.replace(/\W/g, "")
	} else {
		return null
	}

};

const saveContentItem = async ({ contentItem, languageCode }) => {

	if (
		!contentItem ||
		!contentItem.properties
	) {
		logWarning("Null item or item with no properties cannot be saved");
		return;
	}

	let definitionName = sanitizeName(contentItem.properties.definitionName)
	let referenceName = contentItem.properties.referenceName

	if (contentItem.properties.state === 3) {
		//if the item is deleted

		//grab the reference name from the currently saved item...
		const currentItem = await store.getItem({
			options,
			itemType: "item",
			languageCode,
			itemID: contentItem.contentID,
		});
		if (currentItem) {

			await store.deleteItem({
				options,
				itemType: "item",
				languageCode,
				itemID: contentItem.contentID,
			});

		}
	} else {
		//regular item
		if (!contentItem.properties.definitionName
			|| !contentItem.properties.referenceName) {
			logWarning(`Content with id ${contentItem.contentID} does not have the neccessary properties to be saved.`)
			return
		}



		await store.saveItem({
			options,
			item: contentItem,
			itemType: "item",
			languageCode,
			itemID: contentItem.contentID,
		});
	}

	if (referenceName) {
		//save the item by reference name - it might need to be merged into a list
		await store.mergeItemToList({
			options,
			item: contentItem,
			languageCode,
			itemID: contentItem.contentID,
			referenceName,
			definitionName,
		});
	}
};

const savePageItem = async ({ pageItem, languageCode }) => {
	if (pageItem.properties.state === 3) {
		//item is deleted
		await store.deleteItem({
			options,
			itemType: "page",
			languageCode,
			itemID: pageItem.pageID,
		});
	} else {
		//regular item
		await store.saveItem({
			options,
			item: pageItem,
			itemType: "page",
			languageCode,
			itemID: pageItem.pageID,
		});
	}
};

const saveSitemap = async ({ sitemap, channelName, languageCode }) => {
	await store.saveItem({
		options,
		item: sitemap,
		itemType: "sitemap",
		languageCode,
		itemID: channelName,
	});
};

const saveSitemapNested = async ({
	sitemapNested,
	channelName,
	languageCode,
}) => {
	await store.saveItem({
		options,
		item: sitemapNested,
		itemType: "nestedsitemap",
		languageCode,
		itemID: channelName,
	});
};

const saveUrlRedirections = async ({ urlRedirections, languageCode }) => {
	await store.saveItem({
		options,
		item: urlRedirections,
		itemType: "urlredirections",
		languageCode,
		itemID: "urlredirections",
	});
};

const getUrlRedirections = async ({ languageCode }) => {
	return await store.getItem({
		options,
		itemType: "urlredirections",
		languageCode,
		itemID: "urlredirections",
	});
};

const saveSyncState = async ({ syncState, languageCode }) => {
	await store.saveItem({
		options,
		item: syncState,
		itemType: "state",
		languageCode,
		itemID: "sync",
	});
};

const getSyncState = async (languageCode) => {
	return await store.getItem({
		options,
		itemType: "state",
		languageCode,
		itemID: "sync",
	});
};

const getContentItem = async ({ contentID, languageCode, depth = 2 }) => {
	const contentItem = await store.getItem({
		options,
		itemType: "item",
		languageCode,
		itemID: contentID,
	});
	return await expandContentItem({ contentItem, languageCode, depth });
};

const expandContentItem = async ({ contentItem, languageCode, depth }) => {
	if (!contentItem) return null;

	if (depth > 0) {
		//make this work for the .fields or the .customFields property...
		let fields = contentItem.fields;
		if (!fields) fields = contentItem.customFields;
		for (const fieldName in fields) {
			const fieldValue = fields[fieldName];
			if (!fieldValue) {
				//do nothing...
				continue;
			} else if (fieldValue.contentid > 0) {
				//single linked item
				const childItem = await getContentItem({
					contentID: fieldValue.contentid,
					languageCode,
					depth: depth - 1,
				});
				if (childItem != null) fields[fieldName] = childItem;
			} else if (fieldValue.sortids && fieldValue.sortids.split) {
				//multi linked item
				const sortIDAry = fieldValue.sortids.split(",");
				const childItems = [];
				for (const childItemID of sortIDAry) {
					const childItem = await getContentItem({
						contentID: childItemID,
						languageCode,
						depth: depth - 1,
					});
					if (childItem != null) childItems.push(childItem);
				}
				fields[fieldName] = childItems;
			}
		}
	}
	return contentItem;
};

const getContentList = async ({ referenceName, languageCode }) => {
	return await store.getItem({
		options,
		itemType: "list",
		languageCode,
		itemID: referenceName,
	});
};
/**
 * Get a Page based on it's id and languageCode.
 * @param {*} { pageID, languageCode, depth = 3 }
 * @returns
 */
const getPage = async ({ pageID, languageCode, depth = 3 }) => {
	let pageItem = await store.getItem({
		options,
		itemType: "page",
		languageCode,
		itemID: pageID,
	});

	if (depth > 0) {
		//if a depth was specified, pull in the modules (content items) for this page
		for (const zoneName in pageItem.zones) {
			const zone = pageItem.zones[zoneName];

			for (const mod of zone) {
				const moduleItem = await getContentItem({
					options,
					contentID: mod.item.contentid,
					languageCode,
					depth: depth - 1,
				});
				mod.item = moduleItem;
			}
		}
	}

	return pageItem;
};

const getSitemap = async ({ channelName, languageCode }) => {
	return await store.getItem({
		options,
		itemType: "sitemap",
		languageCode,
		itemID: channelName,
	});
};

const getSitemapNested = async ({ channelName, languageCode }) => {
	return await store.getItem({
		options,
		itemType: "nestedsitemap",
		languageCode,
		itemID: channelName,
	});
};

/**
 * Clear everything out.
 */
const clear = async () => {
	await store.clearItems({ options });
};

export default {
	saveContentItem,
	savePageItem,
	getContentItem,
	getContentList,
	getPage,
	getSitemap,
	getSitemapFlat: getSitemap,
	getSitemapNested,
	saveSitemap,
	saveSitemapNested,
	saveUrlRedirections,
	getUrlRedirections,
	getSyncState,
	saveSyncState,
	clear,
	setStore,
	getStore
};
