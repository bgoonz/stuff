'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _types = require('../types');

var _utils = require('../utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var FormattedMessage = function (_Component) {
    _inherits(FormattedMessage, _Component);

    function FormattedMessage(props, context) {
        _classCallCheck(this, FormattedMessage);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormattedMessage).call(this, props, context));

        (0, _utils.invariantIntlContext)(context);
        return _this;
    }

    _createClass(FormattedMessage, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            var values = this.props.values;
            var nextValues = nextProps.values;

            if (!(0, _utils.shallowEquals)(nextValues, values)) {
                return true;
            }

            // Since `values` has already been checked, we know they're not
            // different, so the current `values` are carried over so the shallow
            // equals comparison on the other props isn't affected by the `values`.
            var nextPropsToCheck = _extends({}, nextProps, {
                values: values
            });

            for (var _len = arguments.length, next = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                next[_key - 1] = arguments[_key];
            }

            return _utils.shouldIntlComponentUpdate.apply(undefined, [this, nextPropsToCheck].concat(next));
        }
    }, {
        key: 'render',
        value: function render() {
            var formatMessage = this.context.intl.formatMessage;
            var _props = this.props;
            var id = _props.id;
            var description = _props.description;
            var defaultMessage = _props.defaultMessage;
            var values = _props.values;
            var tagName = _props.tagName;
            var children = _props.children;

            // Creates a token with a random UID that should not be guessable or
            // conflict with other parts of the `message` string.

            var uid = Math.floor(Math.random() * 0x10000000000).toString(16);
            var tokenRegexp = new RegExp('(@__ELEMENT-' + uid + '-\\d+__@)', 'g');

            var generateToken = function () {
                var counter = 0;
                return function () {
                    return '@__ELEMENT-' + uid + '-' + (counter += 1) + '__@';
                };
            }();

            var tokenizedValues = {};
            var elements = {};

            // Iterates over the `props` to keep track of any React Element values
            // so they can be represented by the `token` as a placeholder when the
            // `message` is formatted. This allows the formatted message to then be
            // broken-up into parts with references to the React Elements inserted
            // back in.
            Object.keys(values).forEach(function (name) {
                var value = values[name];

                if ((0, _react.isValidElement)(value)) {
                    var token = generateToken();
                    tokenizedValues[name] = token;
                    elements[token] = value;
                } else {
                    tokenizedValues[name] = value;
                }
            });

            var descriptor = { id: id, description: description, defaultMessage: defaultMessage };
            var formattedMessage = formatMessage(descriptor, tokenizedValues);

            // Split the message into parts so the React Element values captured
            // above can be inserted back into the rendered message. This approach
            // allows messages to render with React Elements while keeping React's
            // virtual diffing working properly.
            var nodes = formattedMessage.split(tokenRegexp).filter(function (part) {
                return !!part;
            }).map(function (part) {
                return elements[part] || part;
            });

            if (typeof children === 'function') {
                return children.apply(undefined, _toConsumableArray(nodes));
            }

            return _react.createElement.apply(undefined, [tagName, null].concat(_toConsumableArray(nodes)));
        }
    }]);

    return FormattedMessage;
}(_react.Component);

exports.default = FormattedMessage;

FormattedMessage.displayName = 'FormattedMessage';

FormattedMessage.contextTypes = {
    intl: _types.intlShape
};

FormattedMessage.propTypes = _extends({}, _types.messageDescriptorPropTypes, {
    values: _react.PropTypes.object,
    tagName: _react.PropTypes.string,
    children: _react.PropTypes.func
});

FormattedMessage.defaultProps = {
    values: {},
    tagName: 'span'
};