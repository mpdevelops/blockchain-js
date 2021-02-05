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
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient
        };
    
        this.pendingTransactions.push(newTransaction);
    
        // returns newly added transaction
        return this.getLastBlock()['index'] + 1;
    }
}

module.exports = Blockchain;