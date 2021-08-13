'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var isRequiredIf_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports,'__esModule',{value:!0});var VALIDATOR_ARG_ERROR_MESSAGE='The typeValidator argument must be a function with the signature function(props, propName, componentName).',MESSAGE_ARG_ERROR_MESSAGE='The error message is optional, but must be a string if provided.',propIsRequired=function propIsRequired(a,b,c,d){if('boolean'==typeof a)return a;return 'function'==typeof a?a(b,c,d):!(!0!==!!a)&&!!a},propExists=function propExists(a,b){return Object.hasOwnProperty.call(a,b)},missingPropError=function missingPropError(a,b,c,d){return d?new Error(d):new Error('Required '+a[b]+' `'+b+'`'+(' was not specified in `'+c+'`.'))},guardAgainstInvalidArgTypes=function guardAgainstInvalidArgTypes(a,b){if('function'!=typeof a)throw new TypeError(VALIDATOR_ARG_ERROR_MESSAGE);if(!!b&&'string'!=typeof b)throw new TypeError(MESSAGE_ARG_ERROR_MESSAGE)},isRequiredIf=function isRequiredIf(a,b,c){return guardAgainstInvalidArgTypes(a,c),function(d,e,f){for(var _len=arguments.length,g=Array(3<_len?_len-3:0),_key=3;_key<_len;_key++)g[_key-3]=arguments[_key];return propIsRequired(b,d,e,f)?propExists(d,e)?a.apply(void 0,[d,e,f].concat(g)):missingPropError(d,e,f,c):a.apply(void 0,[d,e,f].concat(g));// Is not required, so just run typeValidator.
}};exports.default=isRequiredIf;


});

var isRequiredIf = unwrapExports(isRequiredIf_1);

var exenv = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2015 Jed Watson.
  Based on code that is Copyright 2013-2015, Facebook, Inc.
  All rights reserved.
*/
/* global define */

(function () {

	var canUseDOM = !!(
		typeof window !== 'undefined' &&
		window.document &&
		window.document.createElement
	);

	var ExecutionEnvironment = {

		canUseDOM: canUseDOM,

		canUseWorkers: typeof Worker !== 'undefined',

		canUseEventListeners:
			canUseDOM && !!(window.addEventListener || window.attachEvent),

		canUseViewport: canUseDOM && !!window.screen

	};

	if (module.exports) {
		module.exports = ExecutionEnvironment;
	} else {
		window.ExecutionEnvironment = ExecutionEnvironment;
	}

}());
});

var twitterWidgetJs = 'https://platform.twitter.com/widgets.js';

var TwitterTimelineEmbed =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterTimelineEmbed, _Component);

  function TwitterTimelineEmbed(props) {
    var _this;

    _classCallCheck(this, TwitterTimelineEmbed);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterTimelineEmbed).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterTimelineEmbed, [{
    key: "buildChromeOptions",
    value: function buildChromeOptions(options) {
      options.chrome = '';

      if (this.props.noHeader) {
        options.chrome = options.chrome + ' noheader';
      }

      if (this.props.noFooter) {
        options.chrome = options.chrome + ' nofooter';
      }

      if (this.props.noBorders) {
        options.chrome = options.chrome + ' noborders';
      }

      if (this.props.noScrollbar) {
        options.chrome = options.chrome + ' noscrollbar';
      }

      if (this.props.transparent) {
        options.chrome = options.chrome + ' transparent';
      }

      return options;
    }
  }, {
    key: "buildOptions",
    value: function buildOptions() {
      var options = Object.assign({}, this.props.options);

      if (this.props.autoHeight) {
        options.height = this.refs.embedContainer.parentNode.offsetHeight;
      }

      options = Object.assign({}, options, {
        theme: this.props.theme,
        linkColor: this.props.linkColor,
        borderColor: this.props.borderColor,
        lang: this.props.lang
      });
      return options;
    }
  }, {
    key: "renderWidget",
    value: function renderWidget(options) {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (!this.isMountCanceled) {
        window.twttr.widgets.createTimeline({
          sourceType: this.props.sourceType,
          screenName: this.props.screenName,
          userId: this.props.userId,
          ownerScreenName: this.props.ownerScreenName,
          slug: this.props.slug,
          id: this.props.id || this.props.widgetId,
          url: this.props.url
        }, this.refs.embedContainer, options).then(function (element) {
          _this2.setState({
            isLoading: false
          });

          if (onLoad) {
            onLoad(element);
          }
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this3 = this;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterTimelineEmbed, aborting load.');
            return;
          }

          var options = _this3.buildOptions();
          /** Append chrome options */


          options = _this3.buildChromeOptions(options);

          _this3.renderWidget(options);
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterTimelineEmbed;
}(React.Component);

_defineProperty(TwitterTimelineEmbed, "propTypes", {
  /**
       * This can be either of profile, likes, list, collection, URL, widget
       */
  sourceType: PropTypes.oneOf(['profile', 'likes', 'list', 'collection', 'url', 'widget']).isRequired,

  /**
       * username of twitter handle as String
       */
  screenName: isRequiredIf(PropTypes.string, function (props) {
    return !props.hasOwnProperty('userId') && (props.sourceType === 'profile' || props.sourceType === 'likes');
  }),

  /**
       * UserId of twitter handle as number
       */
  userId: isRequiredIf(PropTypes.number, function (props) {
    return !props.hasOwnProperty('screenName') && (props.sourceType === 'profile' || props.sourceType === 'likes');
  }),

  /**
       * To show list, used along with slug
       */
  ownerScreenName: isRequiredIf(PropTypes.string, function (props) {
    return props.sourceType === 'list' && !props.hasOwnProperty('id');
  }),

  /**
       * To show list, used along with ownerScreenName
       */
  slug: isRequiredIf(PropTypes.string, function (props) {
    return props.sourceType === 'list' && !props.hasOwnProperty('id');
  }),

  /**
       * To show list, unique list id
       * Also used with collections, in that case its valid collection id
       */
  id: isRequiredIf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]), function (props) {
    return props.sourceType === 'list' && !props.hasOwnProperty('ownerScreenName') && !props.hasOwnProperty('slug') || props.sourceType === 'collection';
  }),

  /**
       * To show twitter content with url.
       * Supported content includes profiles, likes, lists, and collections.
       */
  url: isRequiredIf(PropTypes.string, function (props) {
    return props.sourceType === 'url';
  }),

  /**
       * To show custom widget
       */
  widgetId: isRequiredIf(PropTypes.string, function (props) {
    return props.sourceType === 'widget';
  }),

  /**
       * Additional options to pass to twitter widget plugin
       */
  options: PropTypes.object,

  /**
       * Automatically fit into parent container height
       */
  autoHeight: PropTypes.bool,

  /**
       * With dark or light theme
       */
  theme: PropTypes.oneOf(['dark', 'light']),

  /**
       * With custom link colors. Note: Only Hex colors are supported.
       */
  linkColor: PropTypes.string,

  /**
       * With custom border colors. Note: Only Hex colors are supported.
       */
  borderColor: PropTypes.string,

  /**
       * Hide the header from timeline
       */
  noHeader: PropTypes.bool,

  /**
       * Hide the footer from timeline
       */
  noFooter: PropTypes.bool,

  /**
       * Hide the border from timeline
       */
  noBorders: PropTypes.bool,

  /**
       * Hide the scrollbars
       */
  noScrollbar: PropTypes.bool,

  /**
       * Enable Transparancy
       */
  transparent: PropTypes.bool,

  /**
       * Custom language code. Supported codes here: https://developer.twitter.com/en/docs/twitter-for-websites/twitter-for-websites-supported-languages/overview.html
       */
  lang: PropTypes.string,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterShareButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterShareButton, _Component);

  function TwitterShareButton(props) {
    var _this;

    _classCallCheck(this, TwitterShareButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterShareButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterShareButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterShareButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createShareButton(_this2.props.url, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterShareButton;
}(React.Component);

_defineProperty(TwitterShareButton, "propTypes", {
  /**
  * Url for sharing
  */
  url: PropTypes.string.isRequired,

  /**
  * Additional options for overriding config. Details at : https://dev.twitter.com/web/tweet-button/parameters
  */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterFollowButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterFollowButton, _Component);

  function TwitterFollowButton(props) {
    var _this;

    _classCallCheck(this, TwitterFollowButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterFollowButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterFollowButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterFollowButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createFollowButton(_this2.props.screenName, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterFollowButton;
}(React.Component);

_defineProperty(TwitterFollowButton, "propTypes", {
  /**
       * Username of twitter user which will be followed on click
       */
  screenName: PropTypes.string.isRequired,

  /**
       * Additional options to be added to the button
       */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterHashtagButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterHashtagButton, _Component);

  function TwitterHashtagButton(props) {
    var _this;

    _classCallCheck(this, TwitterHashtagButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterHashtagButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterHashtagButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterHashtagButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createHashtagButton(_this2.props.tag, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterHashtagButton;
}(React.Component);

_defineProperty(TwitterHashtagButton, "propTypes", {
  /**
       * Tag name for hashtag button
       */
  tag: PropTypes.string.isRequired,

  /**
       * Additional options to be added to the button
       */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterMentionButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterMentionButton, _Component);

  function TwitterMentionButton(props) {
    var _this;

    _classCallCheck(this, TwitterMentionButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterMentionButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterMentionButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterMentionButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createMentionButton(_this2.props.screenName, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterMentionButton;
}(React.Component);

_defineProperty(TwitterMentionButton, "propTypes", {
  /**
   * Username to which you will need to tweet
   */
  screenName: PropTypes.string.isRequired,

  /**
   * Additional options for overriding config.
   */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterTweetEmbed =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterTweetEmbed, _Component);

  function TwitterTweetEmbed(props) {
    var _this;

    _classCallCheck(this, TwitterTweetEmbed);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterTweetEmbed).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterTweetEmbed, [{
    key: "renderWidget",
    value: function renderWidget() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (!window.twttr) {
        console.error('Failure to load window.twttr in TwitterTweetEmbed, aborting load.');
        return;
      }

      if (!this.isMountCanceled) {
        window.twttr.widgets.createTweet(this.props.tweetId, this.refs.embedContainer, this.props.options).then(function (element) {
          _this2.setState({
            isLoading: false
          });

          if (onLoad) {
            onLoad(element);
          }
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this3 = this;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          _this3.renderWidget();
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterTweetEmbed;
}(React.Component);

_defineProperty(TwitterTweetEmbed, "propTypes", {
  /**
       * Tweet id that needs to be shown
       */
  tweetId: PropTypes.string.isRequired,

  /**
       * Additional options to pass to twitter widget plugin
       */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterMomentShare =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterMomentShare, _Component);

  function TwitterMomentShare(props) {
    var _this;

    _classCallCheck(this, TwitterMomentShare);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterMomentShare).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterMomentShare, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterMomentShare, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createMoment(_this2.props.momentId, _this2.refs.shareMoment, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "shareMoment"
      }));
    }
  }]);

  return TwitterMomentShare;
}(React.Component);

_defineProperty(TwitterMomentShare, "propTypes", {
  /**
   * id of Twitter moment to show
   */
  momentId: PropTypes.string.isRequired,

  /**
   * Additional options for overriding config.
   */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterDMButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterDMButton, _Component);

  function TwitterDMButton(props) {
    var _this;

    _classCallCheck(this, TwitterDMButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterDMButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterDMButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterDMButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createDMButton(_this2.props.id, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterDMButton;
}(React.Component);

_defineProperty(TwitterDMButton, "propTypes", {
  /**
  * Twitter user id for DM button
  */
  id: PropTypes.number.isRequired,

  /**
  * Additional options to be added to the button
  */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterVideoEmbed =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterVideoEmbed, _Component);

  function TwitterVideoEmbed(props) {
    var _this;

    _classCallCheck(this, TwitterVideoEmbed);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterVideoEmbed).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterVideoEmbed, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterVideoEmbed, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createVideo(_this2.props.id, _this2.refs.embedContainer).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterVideoEmbed;
}(React.Component);

_defineProperty(TwitterVideoEmbed, "propTypes", {
  /**
       * Id of video tweet.
       */
  id: PropTypes.string.isRequired,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

var TwitterOnAirButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TwitterOnAirButton, _Component);

  function TwitterOnAirButton(props) {
    var _this;

    _classCallCheck(this, TwitterOnAirButton);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TwitterOnAirButton).call(this, props));
    _this.state = {
      isLoading: true
    };
    return _this;
  }

  _createClass(TwitterOnAirButton, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var onLoad = this.props.onLoad;

      if (exenv.canUseDOM) {
        var script = require('scriptjs');

        script(twitterWidgetJs, 'twitter-embed', function () {
          if (!window.twttr) {
            console.error('Failure to load window.twttr in TwitterOnAirButton, aborting load.');
            return;
          }

          if (!_this2.isMountCanceled) {
            window.twttr.widgets.createPeriscopeOnAirButton(_this2.props.username, _this2.refs.embedContainer, _this2.props.options).then(function (element) {
              _this2.setState({
                isLoading: false
              });

              if (onLoad) {
                onLoad(element);
              }
            });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.isMountCanceled = true;
    }
  }, {
    key: "render",
    value: function render() {
      var isLoading = this.state.isLoading;
      var placeholder = this.props.placeholder;
      return React__default.createElement(React__default.Fragment, null, isLoading && placeholder, React__default.createElement("div", {
        ref: "embedContainer"
      }));
    }
  }]);

  return TwitterOnAirButton;
}(React.Component);

_defineProperty(TwitterOnAirButton, "propTypes", {
  /**
   * Username for which you require periscope on air button
   */
  username: PropTypes.string.isRequired,

  /**
   * Additional options for overriding config.
   */
  options: PropTypes.object,

  /**
   * Placeholder while tweet is loading
   */
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

  /**
   * Function to execute after load, return html element
   */
  onLoad: PropTypes.func
});

exports.TwitterTimelineEmbed = TwitterTimelineEmbed;
exports.TwitterShareButton = TwitterShareButton;
exports.TwitterFollowButton = TwitterFollowButton;
exports.TwitterHashtagButton = TwitterHashtagButton;
exports.TwitterMentionButton = TwitterMentionButton;
exports.TwitterTweetEmbed = TwitterTweetEmbed;
exports.TwitterMomentShare = TwitterMomentShare;
exports.TwitterDMButton = TwitterDMButton;
exports.TwitterVideoEmbed = TwitterVideoEmbed;
exports.TwitterOnAirButton = TwitterOnAirButton;
//# sourceMappingURL=index.js.map
