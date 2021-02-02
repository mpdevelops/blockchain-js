class Blockchain {
    constructor() {
        this.chain = [];
        this.newTransactions = [];
    }
    // creates a new block and adds to transaction chain
    createNewBlock(nonce, previousBlockHash, hash) {
        const NEW_BLOCK = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.newTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash,
        };

        this.newTransactions = [];
        this.chain.push(NEW_BLOCK);

        return NEW_BLOCK;
    }
}

module.exports = Blockchain;