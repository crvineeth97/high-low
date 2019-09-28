var HighLow = artifacts.require("./HighLow.sol");

function getRandomHex()
{
    return web3.utils.randomHex(32)
}

function getKeccak(prediction, rnd)
{
    // var rnd = getRandomHex();
    var hx = web3.utils.keccak256(web3.utils.toHex(prediction) + rnd, { encoding: "hex" });
    return web3.utils.hexToBytes(hx);
}

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

contract("HighLow", (accounts) =>
{
	before(async () => {
        this.highLow = await HighLow.deployed()
    })
    
}