'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactIntl = require('./react-intl');

var _loop = function _loop(_key2) {
  if (_key2 === "default") return 'continue';
  Object.defineProperty(exports, _key2, {
    enumerable: true,
    get: function get() {
      return _reactIntl[_key2];
    }
  });
};

for (var _key2 in _reactIntl) {
  var _ret = _loop(_key2);

  if (_ret === 'continue') continue;
}

var _index = require('./locale-data/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

(0, _reactIntl.addLocaleData)(_index2.default); /*
                                                 * Copyright 2015, Yahoo Inc.
                                                 * Copyrights licensed under the New BSD License.
                                                 * See the accompanying LICENSE file for terms.
                                                 */