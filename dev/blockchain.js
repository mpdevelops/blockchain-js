const sha256 = require('../node_modules/sha256/lib/sha256');
const currentNodeUrl = process.argv[3];

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

        // creates genesis block
        this.createNewBlock(100, '0', '0');
    }

    // creates a new block and adds to transaction chain
    createNewBlock(nonce, previousBlockHash, hash) {
        const NEW_BLOCK = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash,
        };

        this.pendingTransactions = [];
        this.chain.push(NEW_BLOCK);

        return NEW_BLOCK;
    }

    // retrieves last block in chain
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    // creates a new transaction and adds it to array of pending transactions
    createNewTransaction(amount, sender, recipient) {
        const NEW_TRANSACTION = {
            amount: amount,
            sender: sender,
            recipient: recipient
        };
    
        this.pendingTransactions.push(NEW_TRANSACTION);
    
        // returns newly added transaction
        return this.getLastBlock()['index'] + 1;
    }

    // takes block and hashes data using SHA256 hashing
    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const DATA_AS_STRING = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const HASH = sha256(DATA_AS_STRING);
        return HASH;
    }

    // repeatedly hash block until correct hash is found
    proofOfWork(previousBlockHash, currentBlockData) {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

        while(hash.substring(0, 4) !== '0000') {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }

        return nonce;
    }
}

module.exports = Blockchain;