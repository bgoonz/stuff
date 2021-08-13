'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _intlMessageformat = require('intl-messageformat');

var _intlMessageformat2 = _interopRequireDefault(_intlMessageformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*
                                                                                                                                                           * Copyright 2015, Yahoo Inc.
                                                                                                                                                           * Copyrights licensed under the New BSD License.
                                                                                                                                                           * See the accompanying LICENSE file for terms.
                                                                                                                                                           */

// This is a "hack" until a proper `intl-pluralformat` package is created.

function resolveLocale(locales) {
    // IntlMessageFormat#_resolveLocale() does not depend on `this`.
    return _intlMessageformat2.default.prototype._resolveLocale(locales);
}

function findPluralFunction(locale) {
    // IntlMessageFormat#_findPluralFunction() does not depend on `this`.
    return _intlMessageformat2.default.prototype._findPluralRuleFunction(locale);
}

var IntlPluralFormat = function IntlPluralFormat(locales) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, IntlPluralFormat);

    var useOrdinal = options.style === 'ordinal';
    var pluralFn = findPluralFunction(resolveLocale(locales));

    this.format = function (value) {
        return pluralFn(value, useOrdinal);
    };
};

exports.default = IntlPluralFormat;