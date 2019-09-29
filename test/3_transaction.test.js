var HighLow = artifacts.require("./HighLow.sol");
var accounts;

web3.eth.getAccounts().then((acc) =>
{
    accounts = acc;
});

function getRandomHex()
{
    return web3.utils.randomHex(32)
}

function getKeccak(prediction, rnd)
{
    // var rnd = getRandomHex();
    var hx = web3.utils.soliditySha3(prediction, rnd);
    return web3.utils.hexToBytes(hx);
}

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

contract("HighLow", (accounts) =>
{
    var highLowInstance;
    before(async () =>
    {
        highLowInstance = await HighLow.deployed();
    })

    it("A user bids and then reveals his bid after betting time", async function ()
    {
        var rnd = getRandomHex();
        var prediction = true;
        var blindedPrediction = getKeccak(prediction, rnd);
        var account = accounts[5];
        var val = web3.utils.toWei("2", "ether");
        await highLowInstance.bet(blindedPrediction, { from: account, value: val });
        await sleep(9000);
        await highLowInstance.reveal(prediction, rnd, { from: account});
    });
})