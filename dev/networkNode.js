const express = require('express');
const Blockchain = require('./blockchain');
const app = express();
const port = process.argv[2];
const bodyParser = require('body-parser');

const rp = require('request-promise');

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
    const newTransaction = req.body;
    const blockIndex = dogecoin.addTransactionToPendingTransactions(newTransaction);
    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transaction/broadcast', (req, res) => {
    const newTransaction = dogecoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    dogecoin.addTransactionToPendingTransaction(newTransaction);
    const requestPromises = [];
    dogecoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then(data => {
        res.json({note: 'Transaction created and broadcasted successfully.'});
    })
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
    
    const requestPromises = [];

    dogecoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then(data => {
        const requestOptions = {
            uri: dogecoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json: true
        };

        return rp(requestOptions);
    }).then(data => {
        res.json({
            note: "New block mined successfully.",
            block: newBlock
        });
    });
});

// receives new block, checks whether is correct block
app.post('/receive-new-block', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = dogecoin.getLastBlock();
    const isCorrectHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if(isCorrectHash && correctIndex) {
        dogecoin.chain.push(newBlock);
        dogecoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        })
    } else {
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
});

// register a node and broadcast it to the network
app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if(dogecoin.networkNodes.indexOf(newNodeUrl) == -1 ) {
        dogecoin.networkNodes.push(newNodeUrl);
    }

    const regNodesPromises = [];

    dogecoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises).then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [...dogecoin.networkNodes, dogecoin.currentNodeUrl] },
            json: true
        };

        return rp(bulkRegisterOptions);
    }).then(data => {
        res.json({note: 'New node registered with network successfully.'});
    });
});

// register a node with the network
app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = dogecoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = dogecoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode) {
        dogecoin.networkNodes.push(newNodeUrl);
    }
    res.json({note: 'New node registered successfully with node.'});
})

// register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = dogecoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = dogecoin.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) {
            dogecoin.networkNodes.push(networkNodeUrl);
        }

    })
});

app.get('/consensus', (req, res) => {
    const requestPromises = [];
    dogecoin.networkNodes.forEach(networkNodeUrl => {
        const requireOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requireOptions));
    });

    Promise.all(requestPromises).then(blockchains => {
        const currentChainLength = dogecoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blockchain => {
            if(blockchain.chain.length() > maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain - blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
        });
        if(!newLongestChain || (newLongestChain && !dogecoin.chainIsValid(newLongestChain))) {
            res.json({
                note: 'Current chain has not been replaced.',
                chain: dogecoin.chain,
            });
        } else (newLongestChain && dogecoin.chainIsValid(newLongestChain)) {
            dogecoin.chain = newLongestChain;
            dogecoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: 'This chain has been replaced.',
                chain: dogecoin.chain
            })
        }
    })
});

app.get('/block/:blockHash', (req, res) => {
    const blockHash = req.params.blockHash;
    const correctBlock = dogecoin.getBlock(blockHash);
    res.json({
        block: correctBlock,
    });
});

app.get('/transaction/:transactionId', (req, res) => {

});

app.get('/address/:address', (req, res) => {

});

app.listen(port, () => {
    console.log(`Listening on port ${port} ...`)
});