import ISO6391 from 'iso-639-1';
import LANGUAGES_ZH_NAMES from './data.js';

export default class ISO6391ZH extends ISO6391 {
  static getLanguages(codes) {
    return super.getLanguages(codes).map(language => {
      Object.assign(language, {
        zhName: ISO6391ZH.getZhName(language.code),
      });
      return language;
    });
  }

  static getZhName(code) {
    return super.validate(code) ? LANGUAGES_ZH_NAMES[code] : '';
  }

  static getAllZhNames() {
    return Object.values(LANGUAGES_ZH_NAMES);
  }
}
