const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');


const sendMail = (message) => {
    return new Promise ((resolve, reject) => {
        const send = require('gmail-send')({
            user: 'andreibstest@gmail.com',
            pass: 'dvszkzymxvievwqa',
            to: ['oprea.daiana28@gmail.com', 'andrei22b@yahho.ro', 'andrei.ancas@bannersnack.com'],
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
    .finally(() => {
        sendAndVerifyNews()
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
