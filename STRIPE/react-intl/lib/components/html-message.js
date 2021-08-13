'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _types = require('../types');

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2015, Yahoo Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the New BSD License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var FormattedHTMLMessage = function (_Component) {
    _inherits(FormattedHTMLMessage, _Component);

    function FormattedHTMLMessage(props, context) {
        _classCallCheck(this, FormattedHTMLMessage);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormattedHTMLMessage).call(this, props, context));

        (0, _utils.invariantIntlContext)(context);
        return _this;
    }

    _createClass(FormattedHTMLMessage, [{
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
            var formatHTMLMessage = this.context.intl.formatHTMLMessage;
            var _props = this.props;
            var id = _props.id;
            var description = _props.description;
            var defaultMessage = _props.defaultMessage;
            var rawValues = _props.values;
            var tagName = _props.tagName;
            var children = _props.children;

            var descriptor = { id: id, description: description, defaultMessage: defaultMessage };
            var formattedHTMLMessage = formatHTMLMessage(descriptor, rawValues);

            if (typeof children === 'function') {
                return children(formattedHTMLMessage);
            }

            // Since the message presumably has HTML in it, we need to set
            // `innerHTML` in order for it to be rendered and not escaped by React.
            // To be safe, all string prop values were escaped when formatting the
            // message. It is assumed that the message is not UGC, and came from the
            // developer making it more like a template.
            //
            // Note: There's a perf impact of using this component since there's no
            // way for React to do its virtual DOM diffing.
            return (0, _react.createElement)(tagName, {
                dangerouslySetInnerHTML: {
                    __html: formattedHTMLMessage
                }
            });
        }
    }]);

    return FormattedHTMLMessage;
}(_react.Component);

exports.default = FormattedHTMLMessage;

FormattedHTMLMessage.displayName = 'FormattedHTMLMessage';

FormattedHTMLMessage.contextTypes = {
    intl: _types.intlShape
};

FormattedHTMLMessage.propTypes = _extends({}, _types.messageDescriptorPropTypes, {
    values: _react.PropTypes.object,
    tagName: _react.PropTypes.string,
    children: _react.PropTypes.func
});

FormattedHTMLMessage.defaultProps = {
    values: {},
    tagName: 'span'
};