'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _intlMessageformat = require('intl-messageformat');

var _intlMessageformat2 = _interopRequireDefault(_intlMessageformat);

var _intlRelativeformat = require('intl-relativeformat');

var _intlRelativeformat2 = _interopRequireDefault(_intlRelativeformat);

var _plural = require('../plural');

var _plural2 = _interopRequireDefault(_plural);

var _intlFormatCache = require('intl-format-cache');

var _intlFormatCache2 = _interopRequireDefault(_intlFormatCache);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _utils = require('../utils');

var _types = require('../types');

var _format = require('../format');

var format = _interopRequireWildcard(_format);

var _localeDataRegistry = require('../locale-data-registry');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var intlConfigPropNames = Object.keys(_types.intlConfigPropTypes);
var intlFormatPropNames = Object.keys(_types.intlFormatPropTypes);

// These are not a static property on the `IntlProvider` class so the intl
// config values can be inherited from an <IntlProvider> ancestor.
var defaultProps = {
    formats: {},
    messages: {},

    defaultLocale: 'en',
    defaultFormats: {}
};

var IntlProvider = function (_Component) {
    _inherits(IntlProvider, _Component);

    function IntlProvider(props, context) {
        _classCallCheck(this, IntlProvider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IntlProvider).call(this, props, context));

        (0, _invariant2.default)(typeof Intl !== 'undefined', '[React Intl] The `Intl` APIs must be available in the runtime, ' + 'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' + 'See: http://formatjs.io/guides/runtime-environments/');

        // Used to stabilize time when performing an initial rendering so that
        // all relative times use the same reference "now" time.
        var initialNow = undefined;
        if (isFinite(props.initialNow)) {
            initialNow = Number(props.initialNow);
        } else {
            // When an `initialNow` isn't provided via `props`, look to see an
            // <IntlProvider> exists in the ancestry and call its `now()`
            // function to propagate its value for "now".
            initialNow = context.intl ? context.intl.now() : Date.now();
        }

        _this.state = {
            // Creating `Intl*` formatters is expensive so these format caches
            // memoize the `Intl*` constructors and have the same lifecycle as
            // this IntlProvider instance.
            getDateTimeFormat: (0, _intlFormatCache2.default)(Intl.DateTimeFormat),
            getNumberFormat: (0, _intlFormatCache2.default)(Intl.NumberFormat),
            getMessageFormat: (0, _intlFormatCache2.default)(_intlMessageformat2.default),
            getRelativeFormat: (0, _intlFormatCache2.default)(_intlRelativeformat2.default),
            getPluralFormat: (0, _intlFormatCache2.default)(_plural2.default),

            // Wrapper to provide stable "now" time for initial render.
            now: function now() {
                return _this._didDisplay ? Date.now() : initialNow;
            }
        };
        return _this;
    }

    _createClass(IntlProvider, [{
        key: 'getConfig',
        value: function getConfig() {
            var _context$intl = this.context.intl;
            var intlContext = _context$intl === undefined ? {} : _context$intl;

            // Build a whitelisted config object from `props`, defaults, and
            // `context.intl`, if an <IntlProvider> exists in the ancestry.

            var config = _extends({}, defaultProps, (0, _utils.filterProps)(this.props, intlConfigPropNames, intlContext));

            if (!(0, _localeDataRegistry.hasLocaleData)(config.locale)) {
                var _config = config;
                var locale = _config.locale;
                var defaultLocale = _config.defaultLocale;
                var defaultFormats = _config.defaultFormats;

                if (process.env.NODE_ENV !== 'production') {
                    console.error('[React Intl] Missing locale data for locale: "' + locale + '". ' + ('Using default locale: "' + defaultLocale + '" as fallback.'));
                }

                // Since there's no registered locale data for `locale`, this will
                // fallback to the `defaultLocale` to make sure things can render.
                // The `messages` are overridden to the `defaultProps` empty object
                // to maintain referential equality across re-renders. It's assumed
                // each <FormattedMessage> contains a `defaultMessage` prop.
                config = _extends({}, config, {
                    locale: defaultLocale,
                    formats: defaultFormats,
                    messages: defaultProps.messages
                });
            }

            return config;
        }
    }, {
        key: 'getBoundFormatFns',
        value: function getBoundFormatFns(config, state) {
            return intlFormatPropNames.reduce(function (boundFormatFns, name) {
                boundFormatFns[name] = format[name].bind(null, config, state);
                return boundFormatFns;
            }, {});
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            var config = this.getConfig();

            // Bind intl factories and current config to the format functions.
            var boundFormatFns = this.getBoundFormatFns(config, this.state);

            return {
                intl: _extends({}, config, boundFormatFns, {
                    now: this.state.now
                })
            };
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
            for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
                next[_key] = arguments[_key];
            }

            return _utils.shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._didDisplay = true;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react.Children.only(this.props.children);
        }
    }]);

    return IntlProvider;
}(_react.Component);

exports.default = IntlProvider;

IntlProvider.displayName = 'IntlProvider';

IntlProvider.contextTypes = {
    intl: _types.intlShape
};

IntlProvider.childContextTypes = {
    intl: _types.intlShape.isRequired
};

IntlProvider.propTypes = _extends({}, _types.intlConfigPropTypes, {
    children: _react.PropTypes.element.isRequired,
    initialNow: _react.PropTypes.any
});