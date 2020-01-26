const express = require('express');
const getAndCheckNews = require('./index');

const app = express();
const port = process.env.PORT || 3000;


setInterval(getAndCheckNews, 300000);
app.get('/', (req, res) => res.send('App is running'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));