'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports['default'] = injectIntl;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _types = require('./types');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

// Inspired by react-redux's `connect()` HOC factory function implementation:
// https://github.com/rackt/react-redux

function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Component';
}

function injectIntl(WrappedComponent) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var _options$intlPropName = options.intlPropName;
    var intlPropName = _options$intlPropName === undefined ? 'intl' : _options$intlPropName;
    var _options$withRef = options.withRef;
    var withRef = _options$withRef === undefined ? false : _options$withRef;

    var InjectIntl = function (_Component) {
        _inherits(InjectIntl, _Component);

        function InjectIntl(props, context) {
            _classCallCheck(this, InjectIntl);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InjectIntl).call(this, props, context));

            (0, _utils.invariantIntlContext)(context);
            return _this;
        }

        _createClass(InjectIntl, [{
            key: 'getWrappedInstance',
            value: function getWrappedInstance() {
                (0, _invariant2.default)(withRef, '[React Intl] To access the wrapped instance, ' + 'the `{withRef: true}` option must be set when calling: ' + '`injectIntl()`');

                return this.refs.wrappedInstance;
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2.default.createElement(WrappedComponent, _extends({}, this.props, _defineProperty({}, intlPropName, this.context.intl), {
                    ref: withRef ? 'wrappedInstance' : null
                }));
            }
        }]);

        return InjectIntl;
    }(_react.Component);

    InjectIntl.displayName = 'InjectIntl(' + getDisplayName(WrappedComponent) + ')';

    InjectIntl.contextTypes = {
        intl: _types.intlShape
    };

    InjectIntl.WrappedComponent = WrappedComponent;

    return InjectIntl;
}