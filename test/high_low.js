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

    it("Checks if all variables are initialized correctly", function ()
    {
        return HighLow.deployed().then(function (instance)
        {
            highLowInstance = instance;
            return highLowInstance.maxNoOfCards();
        }).then(function (count)
        {
            assert.equal(count, 52, "Maximum no of cards is correct");
            return highLowInstance.beneficiary();
        }).then(function (address)
        {
            assert.equal(address, "0x5b327Fd9d785a7fF939f35430Db0fcEDd1a350b6", "Beneficiary, i.e. House address is correct");
            return highLowInstance.biddingTime();
        }).then(function (bidTime)
        {
            assert.equal(bidTime, 30, "Bidding time is set correctly");
            return highLowInstance.revealTime();
        }).then(function (revealTime)
        {
            assert.equal(revealTime, 10, "Reveal time is set correctly");
        });
    });

    it("A user bids and then reveals his bid after bidding time", function ()
    {
        return HighLow.deployed().then(function (instance)
        {
            highLowInstance = instance;
            return highLowInstance;
        }).then(function (highLowInstance)
        {
            var rnd = getRandomHex();
            var prediction = false;
            var byt = getKeccak(prediction, rnd);
            var account = accounts[5];
            var val = 5;
            var balance;
            web3.eth.getBalance(account).then(function (bal)
            {
                balance = web3.utils.fromWei(bal);                
            });
            highLowInstance.bid(byt, { from: account, value: val }).then(function ()
            {
                // Call function to get new balance and check if balance - val = new balance
                assert(balance)
                sleep(3000);
            }).then(function ()
            {
                highLowInstance.reveal(prediction, rnd).then(function ()
                {
                    // Test for balance here again?
                })
            });
        }).then(function (candidate)
        {
            assert.equal(candidate[0], 2, "contains the correct id");
            assert.equal(candidate[1], "Candidate 2", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
        });
    });
});