const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require("path");


const options = {
    uri: 'http://www.aradon.ro',
    transform: (body) => {
        return cheerio.load(body);
    },
};

rp(options)
    .then(($) => {
        $('.enews-article-offerer-title').each((index, element) => {
            const title = $(element).text().replace(/\s\s+/g, '');
            const myWord = 'accident|accidente|pieton|lovit de masina|pieton lovit';
            const reg = new RegExp(`\\b(?:${myWord})\\b`, 'gmi');
            const result = reg.test(title);
            if (result) {
                const link = $(element).find('a').attr('href');
                writeDataToJson(title, link);
                console.log(link)
                console.log(title);
            }
        });
    })
    .catch((err) => {
        console.log(err);
    });


const list = (data) => {
    const findMax = [];
    for (let i = 0; i < data.length; i += 1) {
        findMax.push(data[i].id);
    }
    return findMax;
}
const checkIfTitleExists = (title, data) => {
    let status = true;
    data.forEach(element => {
        if (element.title === title) {
            status = false
        }
    });
    return status;
}
const writeDataToJson = (title, link) => {
    const file = fs.readFileSync(path.resolve(__dirname, "./data.json"));
    const json = JSON.parse(file);

    const check = checkIfTitleExists(title, json);
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

    if (check === true) {
        fs.writeFileSync('data.json', JSON.stringify(json), (err) => {
            if(err)  console.log(err)
        });
        console.log('Writing data to file')
    } else {
        console.log('Title already exists ...skiping')
    }
};
