'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _types = require('../types');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var FormattedPlural = function (_Component) {
    _inherits(FormattedPlural, _Component);

    function FormattedPlural(props, context) {
        _classCallCheck(this, FormattedPlural);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormattedPlural).call(this, props, context));

        (0, _utils.invariantIntlContext)(context);
        return _this;
    }

    _createClass(FormattedPlural, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
            for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
                next[_key] = arguments[_key];
            }

            return _utils.shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
        }
    }, {
        key: 'render',
        value: function render() {
            var formatPlural = this.context.intl.formatPlural;
            var _props = this.props;
            var value = _props.value;
            var other = _props.other;
            var children = _props.children;

            var pluralCategory = formatPlural(value, this.props);
            var formattedPlural = this.props[pluralCategory] || other;

            if (typeof children === 'function') {
                return children(formattedPlural);
            }

            return _react2.default.createElement(
                'span',
                null,
                formattedPlural
            );
        }
    }]);

    return FormattedPlural;
}(_react.Component);

exports.default = FormattedPlural;

FormattedPlural.displayName = 'FormattedPlural';

FormattedPlural.contextTypes = {
    intl: _types.intlShape
};

FormattedPlural.propTypes = _extends({}, _types.pluralFormatPropTypes, {
    value: _react.PropTypes.any.isRequired,

    other: _react.PropTypes.node.isRequired,
    zero: _react.PropTypes.node,
    one: _react.PropTypes.node,
    two: _react.PropTypes.node,
    few: _react.PropTypes.node,
    many: _react.PropTypes.node,

    children: _react.PropTypes.func
});

FormattedPlural.defaultProps = {
    style: 'cardinal'
};