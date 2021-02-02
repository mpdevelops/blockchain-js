const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(2389, '43u342hfu', 'fshdfghjuk');
bitcoin.createNewBlock(2389, '43u342hfu', 'fshdfghjuk');
bitcoin.createNewBlock(2389, '43u342hfu', 'fshdfghjuk');

console.log(bitcoin);