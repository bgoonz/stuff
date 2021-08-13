function logError(consoleMessage) {
    console.error('\x1b[41m%s\x1b[0m', consoleMessage);
}

function logDebug(consoleMessage) {
    console.log('\x1b[33m%s\x1b[0m', consoleMessage);
}

function buildRequestUrlPath(config, languageCode) {
    let apiFetchOrPreview = null;

    if(config.isPreview === true || config.isPreview === 'true') {
        apiFetchOrPreview  = 'preview';
    } else {
        apiFetchOrPreview = 'fetch';
    }

    let urlPath = `${config.baseUrl}/${apiFetchOrPreview}/${languageCode}`;
    return urlPath;
}

function buildPathUrl(contentType, referenceName, skip, take, sort, direction, filters, filtersLogicOperator, contentLinkDepth, expandAllContentLinks) {
    let url = `/${contentType}/${referenceName}?contentLinkDepth=${contentLinkDepth}&`;
    filtersLogicOperator = filtersLogicOperator ? ` ${filtersLogicOperator} ` : ' AND ';

    if (sort) {
        url += `sort=${sort}&`;
        if (direction) {
            url += `direction=${direction}&`;
        }
    }

    if (skip) {
        url += `skip=${skip}&`;
    }

    if (take) {
        url += `take=${take}&`;
    }

    if (filters && filters.length > 0) {
        url += 'filter='
        for (let i = 0; i < filters.length; i++) {
            let filter = filters[i];
            url += `${filter.property}[${filter.operator}]${filter.value}` + (i < filters.length - 1 ? filtersLogicOperator : '');
        }
        url += '&';
    }

    if(expandAllContentLinks) {
        url += `expandAllContentLinks=${expandAllContentLinks}&`;
    }

    return url;
}

function buildAuthHeader(config) {
    let defaultAuthHeaders = {
        'APIKey': config.apiKey
    };

    if(config.requiresGuidInHeaders) {
        defaultAuthHeaders.Guid = config.guid;
    }

    return {
        ...defaultAuthHeaders,
        ...config.headers
    }

}

function isHttps(url) {
    if(!url.toLowerCase().startsWith('https://')) {
        return false;
    }
    return true;
}


export {
    buildPathUrl,
    buildAuthHeader,
    buildRequestUrlPath,
    isHttps,
    logError,
    logDebug
}