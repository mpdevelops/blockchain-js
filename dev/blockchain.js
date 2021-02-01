function Blockchain() {
    this.chain = [];
    this.newTransactions = [];
}

// creates a new block and adds to transaction chain
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const NEW_BLOCK = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.newTransactions,
        none: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
    };

    this.newTransactions = [];
    this.chain.push(NEW_BLOCK);

    return NEW_BLOCK;
}