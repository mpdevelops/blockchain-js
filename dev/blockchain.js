const sha256 = require('../node_modules/sha256/lib/sha256');
const currentNodeUrl = process.argv[3];
const { v4: uuidv4 } = require('uuid');

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
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionId: uuidv4().split('-').join(''),
        };
    
        return newTransaction;
    }

    addTransactionToPendingTransactions(transactionObj) {
        this.pendingTransactions.push(transactionObj);
        return this.getLastBlock()['index'] + 1;
    }

    // takes block and hashes data using SHA256 hashing
    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
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

    // checks chain validity
    chainIsValid(blockchain) {
        let validChain = true;

        for(let i = 0; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const prevBlock = blockchain[i - 1];
            const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']);

            if(blockHash.substring(0, 4) !== '0000'){
                validChain = false;
            }


            if (currentBlock['previousBlockHash'] !== prevBlock['hash']) {
                validChain = false;
            }
        }

        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock['nonce'] === 100;
        const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
        const correctHash = genesisBlock['hash'] === '0';
        const correctTransactions = genesisBlock['transactions'].length === 0;

        if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions){
            validChain = false;
        };

        return validChain;
    }

    getBlock(blockHash) {

        let correctBlock = null;

        this.chain.forEach(block => {
            if(block.hash === blockHash) {
                correctBlock = block;
            }
        })

        return correctBlock;
    }

    getTransaction(transactionId) {
        let correctTransaction = null;
        let correctBlock = null;

        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                if(transaction.transactionId === transactionId) {
                    correctTransaction = transaction;
                    correctBlock = block;
                }
            })
        })
        return {
            transaction: correctTransaction,
            block: correctBlock
        }
    }

    getAddressData(address) {
        const addressTransactions = [];
        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                if(transaction.sender === address || transaction.recipient === address) {
                    addressTransactions.push(transaction);
                };
            });
        });

        let balance = 0;
        addressTransactions.forEach(transaction => {
            if (transaction.recipient === address) {
                balance += transaction.amount;
            } else if(transaction.sender === address) {
                balance -= transaction.amount;
            }
        });

        return {
            addressTransactions: addressTransactions,
            addressBalance: balance
        }
    }
}

module.exports = Blockchain;