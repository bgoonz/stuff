'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
                                                                                                                                                                                                                                                                   * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                   * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                   * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                   */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pluralFormatPropTypes = exports.relativeFormatPropTypes = exports.numberFormatPropTypes = exports.dateTimeFormatPropTypes = exports.messageDescriptorPropTypes = exports.intlShape = exports.intlFormatPropTypes = exports.intlConfigPropTypes = undefined;

var _react = require('react');

var bool = _react.PropTypes.bool;
var number = _react.PropTypes.number;
var string = _react.PropTypes.string;
var func = _react.PropTypes.func;
var object = _react.PropTypes.object;
var oneOf = _react.PropTypes.oneOf;
var shape = _react.PropTypes.shape;
var intlConfigPropTypes = exports.intlConfigPropTypes = {
    locale: string,
    formats: object,
    messages: object,

    defaultLocale: string,
    defaultFormats: object
};

var intlFormatPropTypes = exports.intlFormatPropTypes = {
    formatDate: func.isRequired,
    formatTime: func.isRequired,
    formatRelative: func.isRequired,
    formatNumber: func.isRequired,
    formatPlural: func.isRequired,
    formatMessage: func.isRequired,
    formatHTMLMessage: func.isRequired
};

var intlShape = exports.intlShape = shape(_extends({}, intlConfigPropTypes, intlFormatPropTypes, {
    now: func.isRequired
}));

var messageDescriptorPropTypes = exports.messageDescriptorPropTypes = {
    id: string.isRequired,
    description: string,
    defaultMessage: string
};

var dateTimeFormatPropTypes = exports.dateTimeFormatPropTypes = {
    localeMatcher: oneOf(['best fit', 'lookup']),
    formatMatcher: oneOf(['basic', 'best fit']),

    timeZone: string,
    hour12: bool,

    weekday: oneOf(['narrow', 'short', 'long']),
    era: oneOf(['narrow', 'short', 'long']),
    year: oneOf(['numeric', '2-digit']),
    month: oneOf(['numeric', '2-digit', 'narrow', 'short', 'long']),
    day: oneOf(['numeric', '2-digit']),
    hour: oneOf(['numeric', '2-digit']),
    minute: oneOf(['numeric', '2-digit']),
    second: oneOf(['numeric', '2-digit']),
    timeZoneName: oneOf(['short', 'long'])
};

var numberFormatPropTypes = exports.numberFormatPropTypes = {
    localeMatcher: oneOf(['best fit', 'lookup']),

    style: oneOf(['decimal', 'currency', 'percent']),
    currency: string,
    currencyDisplay: oneOf(['symbol', 'code', 'name']),
    useGrouping: bool,

    minimumIntegerDigits: number,
    minimumFractionDigits: number,
    maximumFractionDigits: number,
    minimumSignificantDigits: number,
    maximumSignificantDigits: number
};

var relativeFormatPropTypes = exports.relativeFormatPropTypes = {
    style: oneOf(['best fit', 'numeric']),
    units: oneOf(['second', 'minute', 'hour', 'day', 'month', 'year'])
};

var pluralFormatPropTypes = exports.pluralFormatPropTypes = {
    style: oneOf(['cardinal', 'ordinal'])
};