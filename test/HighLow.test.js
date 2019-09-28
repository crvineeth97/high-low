var HighLow = artifacts.require("./HighLow.sol");
var accounts;
web3.eth.getAccounts().then(function (acc)
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


contract("HighLow", function (accounts)
{
    var highLowInstance;
    before(async () =>
    {
        highLowInstance = await HighLow.deployed()
    })

    it('Deployed successfully, Address not null', async () =>
    {
        const address = await highLowInstance.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    });

    it("Checks if all variables are initialized correctly", async function ()
    {
        var count = await highLowInstance.maxNoOfCards();
        assert.equal(count, 52, "Maximum no of cards is correct");
        var address = await highLowInstance.beneficiary();
        assert.equal(address, accounts[9], "Beneficiary, i.e. House address is correct");
        var bidTime = await highLowInstance.biddingTime();
        assert.equal(bidTime, 30, "Bidding time is set correctly");
        var revealTime = await highLowInstance.revealTime();
        assert.equal(revealTime, 10, "Reveal time is set correctly");
    });

    it("A user bids and then reveals his bid after bidding time", async function ()
    {
        var rnd = getRandomHex();
        var prediction = false;
        var blindedPrediction = getKeccak(prediction, rnd);
        var account = accounts[5];
        var val = 5;
        var oldBalance = web3.utils.fromWei(await web3.eth.getBalance(account));
        await highLowInstance.bet(blindedPrediction, { from: account, value: val });
        // Call function to get new balance and check if balance - val = new balance
        var newBalance = web3.utils.fromWei(await web3.eth.getBalance(account));
        assert.equal(oldBalance - val, newBalance);
        await sleep(3000);
        await highLowInstance.reveal(prediction, rnd);
        // Test for balance here again?
    });
});