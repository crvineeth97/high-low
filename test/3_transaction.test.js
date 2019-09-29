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
    var hx = web3.utils.keccak256(web3.utils.toHex(prediction) + rnd, { encoding: "hex" });
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
        await highLowInstance.initializeRound();
    })

    it("A user bids and then reveals his bid after betting time", async function ()
    {
        var rnd = getRandomHex();
        var prediction = false;
        var blindedPrediction = getKeccak(prediction, rnd);
        var account = accounts[5];
        var val = web3.utils.toWei(2, "ether");
        var oldBalance = await web3.eth.getBalance(account);
        await highLowInstance.bet(blindedPrediction, { from: account, value: val.toString() });
        // Call function to get new balance and check if balance - val = new balance
        var newBalance = await web3.eth.getBalance(account);
        assert.equal(oldBalance - val, newBalance);
        await sleep(3000);
        await highLowInstance.reveal(prediction, rnd);
        // Test for balance here again?
    });
})