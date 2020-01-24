const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require("path");


const options = {
    uri: 'http://www.bihon.ro',
    transform: (body) => {
        return cheerio.load(body);
    },
};

// Aici aduc ultimele titluri de stiri
// rp(options)
//     .then(($) => {
//         $('.enews-article-offerer-title').each((index, element) => {
//             const title = $(element).text().replace(/\s\s+/g, '');
//             const myWord = 'accident|accidente|pieton|lovit de masina|pieton lovit';
//             const reg = new RegExp(`\\b(?:${myWord})\\b`, 'gmi');
//             const result = reg.test(title);
//             if (result) {
//                 const link = $(element).find('a').attr('href');
//                 console.log(link)
//                 console.log(title);
//             }
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//     });


const list = (data) => {
    const findMax = [];
    for (let i = 0; i < data.length; i += 1) {
        findMax.push(data[i].id);
    }
    return findMax;
}
const checkIfTitleExists = (title, data) => {
    // TODO: Check if status === false return acum vine true tot timpu
    let status = true;
    for (let i = 0; i < data.length; i += 1) {
        console.log(data[i].title, title)
        if (data[i].title === title) {
            status = false;
        }
        return status;
    }
}
const writeDataToJson = (title, link) => {
    const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./data.json")));

    const check = checkIfTitleExists(title, json);
    console.log(check);
    const newArr = list(json);
    let max;
    if (newArr.length !== 0) {
        max = newArr.reduce((a, b) => { return Math.max(a, b); });
    }

    const currentDate = new Date(Date.now()).toLocaleString();
    const newErr = {
        id: Number(max) + 1,
        date: currentDate,
        title: title,
        url: link,
        status: false
    };
    json.push(newErr);
    fs.writeFile('data.json', JSON.stringify(json), (err) => {
        if(err)  console.log(err)
    });
};

writeDataToJson('titlu', 'link');