const sha256 = require('../node_modules/sha256/lib/sha256');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
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
}

module.exports = Blockchain;