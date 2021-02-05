const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

const previousBlockHash = 'DFSHFDHFSD';
const currentBlockData = [
    {
        amount: 10,
        sender: 'NFJFJDF',
        recipient: '90SDFFSDDF'
    }
]

const nonce = 100;

console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce));