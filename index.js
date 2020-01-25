const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');


const sendMail = (message) => {
    return new Promise ((resolve, reject) => {
        const send = require('gmail-send')({
            user: 'andreibstest@gmail.com',
            pass: 'dvszkzymxvievwqa',
            to: ['oprea.daiana28@gmail.com', 'andrei22b@yahoo.ro'],
            subject: 'Accident nou !!!',
        });
    
        send({
            text: message,  
        }, (error, result, fullResult) => {
            if (error) reject(error);
                resolve(result);
        })     
    });
}


const getAndCheckNews = () => {
    const sources = {
        bihon: {
            website: "http://www.bihon.ro",
            title: '.enews-article-offerer-title',
            link: {
                el: 'a',
                attr: 'href'
            },
        },
        tion: {
            website: "http://www.tion.ro",
            title: '.enews-article-offerer-title',
            link: {
                el: 'a',
                attr: 'href'
            },
        },
        aradon: {
            website: "http://www.aradon.ro",
            title: '.enews-article-offerer-title',
            link: {
                el: 'a',
                attr: 'href'
            },
        },
        ebihoreanul: {
            website: "https://www.ebihoreanul.ro/",
            title: 'div.title',
            link: {
                el: 'a',
                attr: 'href'
            },
        },
        zcj: {
            website: "https://zcj.ro/",
            title: 'div.post-wrapper > div.row >div > h3',
            link: {
                el: 'a',
                attr: 'href'
            },
        },
        portalsm: {
            website: "https://portalsm.ro/",
            title: 'h2.st-loop-entry-title > a',
            link: {
                el: 'h2.st-loop-entry-title > a',
                attr: 'href'
            },
        },
    }

    Object.keys(sources).forEach((el) => {
        const options = {
            uri: sources[el].website,
            transform: (body) => {
                return cheerio.load(body);
            },
        };

        rp(options)
        .then(($) => {
            $(sources[el].title).each((index, element) => {
                const title = $(element).text().replace(/\s\s+/g, '');
                const myWord = 'biciclist lovit|biciclistul lovit|femeie lovita|barbat lovit|copil lovit|descracerat|descarcerat|descarcerati|impact frontal|impactul frontal|accident|accidente|pieton|lovit de masina|pieton lovit';
                const reg = new RegExp(`\\b(?:${myWord})\\b`, 'gmi');
                const result = reg.test(title);
                if (result) {
                    let link;
                    if (el === 'portalsm') {
                        link = $(element).attr(sources[el].link.attr);
                    } else {
                        link = $(element).find(sources[el].link.el).attr(sources[el].link.attr);
                    }
                    writeDataToJson(title, link);
                    console.log(link)
                    console.log(title);
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
    });
    sendAndVerifyNews()
}



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

const sendAndVerifyNews = () => {
    const file = fs.readFileSync(path.resolve(__dirname, "./data.json"));
    const json = JSON.parse(file);
    let msg;
    json.forEach((el) => {
        if (el.status === false) {
            msg = `
                Title: ${el.title}
                Link: ${el.url}
            `;
            const p = sendMail(msg);
            p.then((res) => {
                const resStatus = parseInt(res.slice(0, 3));
                if (resStatus === 250) {
                    el.status = true;
                    fs.writeFileSync('data.json', JSON.stringify(json), (err) => {
                        if(err)  console.log(err)
                    });
                }
            })
        }
    })
}

// TODO: facut sa verifice la interval de 5 minute
// TODO: trebuie integrata verificarea si pe facebook
// TODO: trebuie sa mearga si cu alte site-uri 
// TODO: trebuie gasit un server de unde sa ruleze


setInterval(getAndCheckNews, 300000);