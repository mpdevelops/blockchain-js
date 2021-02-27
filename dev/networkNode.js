const express = require('express');
const Blockchain = require('./blockchain');
const app = express();
const port = process.argv[2];
const bodyParser = require('body-parser');

const { v4: uuidv4 } = require('uuid');
const nodeAddress = uuidv4().split('-').join('');

const dogecoin= new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// gets entire blockchain
app.get('/blockchain', (req, res) => {
    res.send(dogecoin);
});

// creates a new transaction
app.post('/transaction', (req, res) => {
    const blockIndex = dogecoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({note: `Transaction will be added to block ${blockIndex}.`});
});

// mines a new block
app.get('/mine', (req, res) => {
    const lastBlock = dogecoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: dogecoin.pendingTransactions,
        index: lastBlock['index'] + 1,
    };
    const nonce = dogecoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = dogecoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    
    dogecoin.createNewTransaction(12.5, "00", nodeAddress);
    
    const newBlock = dogecoin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        note: "New block mined successfully.",
        block: newBlock
    })
});

app.listen(port, () => {
    console.log(`Listening on port ${port} ...`)
});