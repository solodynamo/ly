import "babel-polyfill";
import request from 'request';
import cheerio from 'cheerio';
import updateNotifier from 'update-notifier';
import _ from 'underscore';
import pkg from '../package.json';

updateNotifier({
  pkg
}).notify()

let args = process.argv.slice(2);

if (args.length !== 2 || args[0].length == 0 || args[1].length == 0) {
  console.log("Example: lyc 'john lennon' 'give peace a chance'");
} else {
  const url = `http://lyrics.wikia.com/wiki/${args[0]}:${args[1]}`;
  request(url, (error, response, html) => {
    if (error) {
      res.json({
        lyric: "",
        err: error
      });
    } else {

      const $ = cheerio.load(html);
      $('script').remove();
      let lyrics = ($('.lyricbox').html());

      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "'": '&apos;',
        '`': '&#x60;',
        '': '\n'
      };
      const unescapeMap = _.invert(escapeMap);
      const createEscaper = map => {
        const escaper = match => map[match];
        const source = `(?:${_.keys(map).join('|')})`;
        const testRegexp = RegExp(source);
        const replaceRegexp = RegExp(source, 'g');
        return string => {
          string = string == null ? '' : `${string}`;
          return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
      };
      _.escape = createEscaper(escapeMap);
      _.unescape = createEscaper(unescapeMap);

      // replace html codes with punctuation
      lyrics = _.unescape(lyrics);
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
