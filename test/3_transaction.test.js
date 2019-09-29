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
        highLowInstance.initializeRound();
    })

    after(async () =>
    {
        highLowInstance.endGame();
    })

    it("A user bids and then reveals his bid after betting time", async function ()
    {
        var rnd = getRandomHex();
        var prediction = true;
        var blindedPrediction = getKeccak(prediction, rnd);
        var account = accounts[5];
        var val = web3.utils.toWei("2", "ether");
        var oldbalance = await web3.eth.getBalance(account);
        var placedCard = await highLowInstance.placedCard();
        await highLowInstance.bet(blindedPrediction, { from: account, value: val });
        var newbalance = await web3.eth.getBalance(account);
        assert.isTrue(newbalance < oldbalance - web3.utils.toBN(val), "Amount not deducted");
        await sleep(6000);
        await highLowInstance.reveal(prediction, rnd, { from: account});
        var newPlacedCard = await highLowInstance.placedCard();
        if (placedCard.number < newPlacedCard.number)
        {
            newbalance = await web3.eth.getBalance(account);
            assert.isTrue(newbalance > oldbalance, "Error did not receive money");
            // assert.isTrue(newbalance < oldbalance + 2 * web3.utils.toBN(val), "Error did not receive money");
        }
        else
        {
            newbalance = await web3.eth.getBalance(account);
            // assert.isTrue(newbalance < oldbalance, "Error did not lose money");
            assert.isTrue(newbalance < oldbalance - 2 * web3.utils.toBN(val), "Error did not lose money");
        }
    });
})