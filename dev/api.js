const express = require('express');
const Blockchain = require('./blockchain');
const app = express();
const port = 3000;

app.get('/blockchain', (req, res) => {

});

app.post('/transaction', (req, res) => {
    res.send("Hello");
});

app.get('/my_blockchain', (req, res) => {

});

app.listen(port, () => {
    console.log('Listening on port 3000...')
});