const assert = require('assert');
const ISO639ZH = require('../build/index');
const LANGUAGES_ZH_NAMES = require('../build/data');

const zhNameList = Object.keys(LANGUAGES_ZH_NAMES).map(code => LANGUAGES_ZH_NAMES[code]);

describe('getZhName()', () => {
  it('en', () => assert.equal(ISO639ZH.getZhName('en'), '英语'));
  it('zh', () => assert.equal(ISO639ZH.getZhName('zh'), '中文'));
});

describe('getAllZhNames()', () => {
  it('All languages Chinese names match', () =>
    assert.deepEqual(ISO639ZH.getAllZhNames(), zhNameList));
});

describe('getLanguages()', () => {
  it('[en,es]', () => {
    assert.deepEqual(ISO639ZH.getLanguages(['en', 'es']), [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        zhName: '英语',
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        zhName: '西班牙语',
      },
    ]);
  });
});
