'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
/*
HTML escaping and shallow-equals implementations are the same as React's
(on purpose.) Therefore, it has the following Copyright and Licensing:

Copyright 2013-2014, Facebook, Inc.
All rights reserved.

This source code is licensed under the BSD-style license found in the LICENSE
file in the root directory of React's source tree.
*/

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.escape = escape;
exports.filterProps = filterProps;
exports.invariantIntlContext = invariantIntlContext;
exports.shallowEquals = shallowEquals;
exports.shouldIntlComponentUpdate = shouldIntlComponentUpdate;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var intlConfigPropNames = Object.keys(_types.intlConfigPropTypes);

var ESCAPED_CHARS = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '"': '&quot;',
    '\'': '&#x27;'
};

var UNSAFE_CHARS_REGEX = /[&><"']/g;

function escape(str) {
    return ('' + str).replace(UNSAFE_CHARS_REGEX, function (match) {
        return ESCAPED_CHARS[match];
    });
}

function filterProps(obj, whitelist) {
    var defaults = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return whitelist.reduce(function (filtered, name) {
        if (obj.hasOwnProperty(name)) {
            filtered[name] = obj[name];
        } else if (defaults.hasOwnProperty(name)) {
            filtered[name] = defaults[name];
        }

        return filtered;
    }, {});
}

function invariantIntlContext() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var intl = _ref.intl;

    (0, _invariant2.default)(intl, '[React Intl] Could not find required `intl` object. ' + '<IntlProvider> needs to exist in the component ancestry.');
}

function shallowEquals(objA, objB) {
    if (objA === objB) {
        return true;
    }

    if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
        return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
    for (var i = 0; i < keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
}

function shouldIntlComponentUpdate(_ref2, nextProps, nextState) {
    var props = _ref2.props;
    var state = _ref2.state;
    var _ref2$context = _ref2.context;
    var context = _ref2$context === undefined ? {} : _ref2$context;
    var nextContext = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var _context$intl = context.intl;
    var intl = _context$intl === undefined ? {} : _context$intl;
    var _nextContext$intl = nextContext.intl;
    var nextIntl = _nextContext$intl === undefined ? {} : _nextContext$intl;

    return !shallowEquals(nextProps, props) || !shallowEquals(nextState, state) || !shallowEquals(filterProps(nextIntl, intlConfigPropNames), filterProps(intl, intlConfigPropNames));
}