var HighLow = artifacts.require("./HighLow.sol");

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

    // it("it initializes the candidates with the correct values", function ()
    // {
    //     return HighLow.deployed().then(function (instance)
    //     {
    //         highLowInstance = instance;
    //         return highLowInstance.candidates(1);
    //     }).then(function (candidate)
    //     {
    //         assert.equal(candidate[0], 1, "contains the correct id");
    //         assert.equal(candidate[1], "Candidate 1", "contains the correct name");
    //         assert.equal(candidate[2], 0, "contains the correct votes count");
    //         return highLowInstance.candidates(2);
    //     }).then(function (candidate)
    //     {
    //         assert.equal(candidate[0], 2, "contains the correct id");
    //         assert.equal(candidate[1], "Candidate 2", "contains the correct name");
    //         assert.equal(candidate[2], 0, "contains the correct votes count");
    //     });
    // });
});