# iso-639-1-zh

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Download Count][download-url]][npm-url]

[travis-image]: https://travis-ci.org/meikidd/iso-639-1-zh.svg?branch=master
[travis-url]: https://travis-ci.org/meikidd/iso-639-1-zh
[npm-image]: https://img.shields.io/npm/v/iso-639-1-zh.svg?style=flat-square
[npm-url]: https://npmjs.org/package/iso-639-1-zh
[download-url]: https://img.shields.io/npm/dt/iso-639-1-zh.svg?style=flat-square

Chinese name for iso-639-1 languages.   
各国语言的中文名称. 例如：zh - 中文; en - 英语; es - 西班牙语;

## Installation

```
npm install iso-639-1-zh
```

## Methods


### getZhName(code)
  - @param code {string}
  - @return {string}

Lookup language chinese name by code

### getAllZhNames()
  - @return {array}

Get array of all language chinese names


## Usage

```
var ISO639ZH = require('./iso-639-1-zh')

console.log(ISO639ZH.getZhName('zh')) // '中文'
console.log(ISO639ZH.getZhName('es')) // '西班牙语'
console.log(ISO639ZH.getLanguages(['en', 'es']))
// [{code:'en',name:'English',nativeName:'English',zhName:'英语'},{code:'es',name:'Spanish',nativeName:'Español',zhName:'西班牙语'}]
```
除此之外，还继承了 [iso-639-1](https://github.com/meikidd/iso-639-1) 模块的所有功能