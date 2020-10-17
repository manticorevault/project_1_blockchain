/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    async initializeChain() {

        if (this.height === -1) {
            let block = new BlockClass.Block({ data: "Genesis Block" });

            await this._addBlock(block);
        }
    }

    getChainHeight() {

        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    _addBlock(block) {

        let self = this;

        return new Promise(async (resolve, reject) => {

            block.height = self.height + 1;
            block.time = new Date().getTime().toString().slice(0, -3);

            if (self.chain.length > 0) {

                block.previousBlockHash = self.chain[self.height].hash;

            }

            block.hash = SHA256(JSON.stringify(block)).toString();
            self.chain.push(block);
            self.height += 1;


            if (self.chain[self.height] == block) {

                resolve(block);

            } else {

                reject("This block could not be added");

            }
        });
    }

    requestMessageOwnershipVerification(address) {

        return new Promise((resolve) => {
            resolve(address + ':' + new Date().getTime().toString().slice(0, -3) + ':starRegistry');

        });
    }

    submitStar(address, message, signature, star) {

        let self = this;

        return new Promise(async (resolve, reject) => {

            let time = parseInt(message.split(':')[1]);
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

            if ((time + (5 * 60 * 1000)) >= currentTime) {

                if (bitcoinMessage.verify(message, address, signature)) {

                    let block = new BlockClass.Block({ "owner": address, "star": star });
                    await self._addBlock(block);

                    resolve(block);

                } else {

                    reject("This block's signature is not valid.")
                }

            } else {

                reject("This block could not be added to the chain");

            }
        });
    }

    getBlockByHash(hash) {

        let self = this;

        return new Promise((resolve) => {

            let block = self.chain.filter(marker => marker.hash === hash)[0];

            if (block) {

                resolve(block);

            } else {

                resolve(null);

            }
        });
    }

    getBlockByHeight(height) {

        let self = this;

        return new Promise((resolve) => {

            let block = self.chain.filter(marker => marker.height === height)[0];

            if (block) {

                resolve(block);

            } else {

                resolve(null);

            }
        });
    }

    getStarsByWalletAddress(address) {

        let self = this;
        let starsCollection = [];

        return new Promise((resolve) => {

            self.chain.forEach(function (block) {

                block.getBlockData()
                    .then(data => {

                        if (data.owner) {

                            starsCollection.push(data);

                        }
                    });
            });
            resolve(stars);
        });
    }

    validateChain() {

        let self = this;
        let errorLog = [];

        return new Promise(async (resolve, reject) => {

            if (self.height > 0) {

                for (let counter = 1; counter <= self.height; counter++) {

                    let block = self.chain[counter];
                    let validate = await block.validateBlock();

                    if (validate === false) {

                        console.log("There was error while trying to validate this block");

                    } else if (block.previousBlockHash != self.chain[counter - 1].hash) {

                        console.log("There was an error with this block's previous hash");

                    }
                }

                if (errorLog) {

                    resolve(errorLog);

                } else {

                    resolve("This chain was validated.");

                }

            } else {

                reject("This chain could not be validated").catch(error => {
                    console.log('caught', error.message);

                });
            }
        })
            .then(validChain => {
                console.log(validChain);
            })
            .catch(invalidChain => {
                console.log(invalidChain);
            });
    }
}

module.exports.Blockchain = Blockchain;