const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
    uri: 'http://www.bihon.ro',
    transform: (body) => {
        return cheerio.load(body);
    },
};
// Aici aduc ultimele titl-uri de stiri
rp(options)
    .then(($) => {
        $('.enews-article-offerer-title').each((index, element) => {
            const title = $(element).text();
            const myWord = 'Accident|Fostul procuror';
            const reg = new RegExp(`\\b(?:${myWord})\\b`, 'gmi');
            const result = reg.test(title);
            if (result) {
                console.log(title);
            }
        });
    })
    .catch((err) => {
        console.log(err);
    });
