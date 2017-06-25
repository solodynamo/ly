'use strict';

require('babel-polyfill');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _updateNotifier2.default)({
  pkg: _package2.default
}).notify();

var args = process.argv.slice(2);

if (args.length !== 2 || args[0].length == 0 || args[1].length == 0) {
  console.log("Example: lyc 'john lennon' 'give peace a chance'");
} else {
  var url = 'http://lyrics.wikia.com/wiki/' + args[0] + ':' + args[1];
  (0, _request2.default)(url, function (error, response, html) {
    if (error) {
      res.json({
        lyric: "",
        err: error
      });
    } else {
      var _escapeMap;

      var $ = _cheerio2.default.load(html);
      $('script').remove();
      var lyrics = $('.lyricbox').html();

      var escapeMap = (_escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      }, _defineProperty(_escapeMap, '\'', '&apos;'), _defineProperty(_escapeMap, '`', '&#x60;'), _defineProperty(_escapeMap, '', '\n'), _escapeMap);
      var unescapeMap = _underscore2.default.invert(escapeMap);
      var createEscaper = function createEscaper(map) {
        var escaper = function escaper(match) {
          return map[match];
        };
        var source = '(?:' + _underscore2.default.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
          string = string == null ? '' : '' + string;
          return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
      };
      _underscore2.default.escape = createEscaper(escapeMap);
      _underscore2.default.unescape = createEscaper(unescapeMap);

      // replace html codes with punctuation
      lyrics = _underscore2.default.unescape(lyrics);
      // remove everything between brackets
      lyrics = lyrics.replace(/\[[^\]]*\]/g, '');
      // remove html comments
      lyrics = lyrics.replace(/(<!--)[^-]*-->/g, '');
      // replace newlines
      lyrics = lyrics.replace(/<br>/g, '\n');
      // remove all tags
      lyrics = lyrics.replace(/<[^>]*>/g, '');
      if (lyrics.length === 0) {
        console.log('🤔 Sure of the letters ?');
      } else {
        console.log(lyrics);
      }
    }
  });
}