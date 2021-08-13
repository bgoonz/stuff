'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.formatRelative = formatRelative;
exports.formatNumber = formatNumber;
exports.formatPlural = formatPlural;
exports.formatMessage = formatMessage;
exports.formatHTMLMessage = formatHTMLMessage;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _types = require('./types');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var DATE_TIME_FORMAT_OPTIONS = Object.keys(_types.dateTimeFormatPropTypes); /*
                                                                             * Copyright 2015, Yahoo Inc.
                                                                             * Copyrights licensed under the New BSD License.
                                                                             * See the accompanying LICENSE file for terms.
                                                                             */

var NUMBER_FORMAT_OPTIONS = Object.keys(_types.numberFormatPropTypes);
var RELATIVE_FORMAT_OPTIONS = Object.keys(_types.relativeFormatPropTypes);
var PLURAL_FORMAT_OPTIONS = Object.keys(_types.pluralFormatPropTypes);

function getNamedFormat(formats, type, name) {
    var format = formats && formats[type] && formats[type][name];
    if (format) {
        return format;
    }

    if (process.env.NODE_ENV !== 'production') {
        console.error('[React Intl] No ' + type + ' format named: ' + name);
    }
}

function formatDate(config, state, value) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;
    var formats = config.formats;
    var format = options.format;

    var date = new Date(value);
    var defaults = format && getNamedFormat(formats, 'date', format);
    var filteredOptions = (0, _utils.filterProps)(options, DATE_TIME_FORMAT_OPTIONS, defaults);

    return state.getDateTimeFormat(locale, filteredOptions).format(date);
}

function formatTime(config, state, value) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;
    var formats = config.formats;
    var format = options.format;

    var date = new Date(value);
    var defaults = format && getNamedFormat(formats, 'time', format);
    var filteredOptions = (0, _utils.filterProps)(options, DATE_TIME_FORMAT_OPTIONS, defaults);

    // When no formatting options have been specified, default to outputting a
    // time; e.g.: "9:42 AM".
    if (Object.keys(filteredOptions).length === 0) {
        filteredOptions = {
            hour: 'numeric',
            minute: 'numeric'
        };
    }

    return state.getDateTimeFormat(locale, filteredOptions).format(date);
}

function formatRelative(config, state, value) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;
    var formats = config.formats;
    var format = options.format;

    var date = new Date(value);
    var now = new Date(options.now);
    var defaults = format && getNamedFormat(formats, 'relative', format);
    var filteredOptions = (0, _utils.filterProps)(options, RELATIVE_FORMAT_OPTIONS, defaults);

    return state.getRelativeFormat(locale, filteredOptions).format(date, {
        now: isFinite(now) ? now : state.now()
    });
}

function formatNumber(config, state, value) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;
    var formats = config.formats;
    var format = options.format;

    var defaults = format && getNamedFormat(formats, 'number', format);
    var filteredOptions = (0, _utils.filterProps)(options, NUMBER_FORMAT_OPTIONS, defaults);

    return state.getNumberFormat(locale, filteredOptions).format(value);
}

function formatPlural(config, state, value) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;

    var filteredOptions = (0, _utils.filterProps)(options, PLURAL_FORMAT_OPTIONS);

    return state.getPluralFormat(locale, filteredOptions).format(value);
}

function formatMessage(config, state) {
    var messageDescriptor = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    var values = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var locale = config.locale;
    var formats = config.formats;
    var messages = config.messages;
    var defaultLocale = config.defaultLocale;
    var defaultFormats = config.defaultFormats;
    var id = messageDescriptor.id;
    var defaultMessage = messageDescriptor.defaultMessage;

    // `id` is a required field of a Message Descriptor.

    (0, _invariant2.default)(id, '[React Intl] An `id` must be provided to format a message.');

    var message = messages && messages[id];
    var hasValues = Object.keys(values).length > 0;

    // Avoid expensive message formatting for simple messages without values. In
    // development messages will always be formatted in case of missing values.
    if (!hasValues && process.env.NODE_ENV === 'production') {
        return message || defaultMessage || id;
    }

    var formattedMessage = undefined;

    if (message) {
        try {
            var formatter = state.getMessageFormat(message, locale, formats);

            formattedMessage = formatter.format(values);
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[React Intl] Error formatting message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : '') + ('\n' + e));
            }
        }
    } else {
        if (process.env.NODE_ENV !== 'production') {
            // This prevents warnings from littering the console in development
            // when no `messages` are passed into the <IntlProvider> for the
            // default locale, and a default message is in the source.
            if (!defaultMessage || locale && locale.toLowerCase() !== defaultLocale.toLowerCase()) {

                console.error('[React Intl] Missing message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : ''));
            }
        }
    }

    if (!formattedMessage && defaultMessage) {
        try {
            var formatter = state.getMessageFormat(defaultMessage, defaultLocale, defaultFormats);

            formattedMessage = formatter.format(values);
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[React Intl] Error formatting the default message for: "' + id + '"' + ('\n' + e));
            }
        }
    }

    if (!formattedMessage) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[React Intl] Cannot format message: "' + id + '", ' + ('using message ' + (message || defaultMessage ? 'source' : 'id') + ' as fallback.'));
        }
    }

    return formattedMessage || message || defaultMessage || id;
}

function formatHTMLMessage(config, state, messageDescriptor) {
    var rawValues = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    // Process all the values before they are used when formatting the ICU
    // Message string. Since the formatted message might be injected via
    // `innerHTML`, all String-based values need to be HTML-escaped.
    var escapedValues = Object.keys(rawValues).reduce(function (escaped, name) {
        var value = rawValues[name];
        escaped[name] = typeof value === 'string' ? (0, _utils.escape)(value) : value;
        return escaped;
    }, {});

    return formatMessage(config, state, messageDescriptor, escapedValues);
}