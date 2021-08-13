'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addLocaleData = addLocaleData;
exports.hasLocaleData = hasLocaleData;

var _intlMessageformat = require('intl-messageformat');

var _intlMessageformat2 = _interopRequireDefault(_intlMessageformat);

var _intlRelativeformat = require('intl-relativeformat');

var _intlRelativeformat2 = _interopRequireDefault(_intlRelativeformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

function addLocaleData() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var locales = Array.isArray(data) ? data : [data];

    locales.forEach(function (localeData) {
        _intlMessageformat2.default.__addLocaleData(localeData);
        _intlRelativeformat2.default.__addLocaleData(localeData);
    });
}

function hasLocaleData(locale) {
    var normalizedLocale = locale && locale.toLowerCase();

    return !!(_intlMessageformat2.default.__localeData__[normalizedLocale] && _intlRelativeformat2.default.__localeData__[normalizedLocale]);
}