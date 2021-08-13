const saveItem = async ({ options, item, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: saveItem has been called`);
    return null;
}

const deleteItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: deleteItem has been called`);
    return null;
}

const mergeItemToList = async ({ options, item, languageCode, itemID, referenceName, definitionName }) => {
	console.log(`Console Interface: mergeItemToList has been called`);
    return null;
}

const getItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: getItem has been called`)
    return null;
}

const clearItems = async ({ options }) => {
    console.log(`Console Interface: clearItem has been called`)
    return null;
}

module.exports = {
    saveItem,
    deleteItem,
    mergeItemToList,
    getItem,
    clearItems
}